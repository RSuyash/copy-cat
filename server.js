const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mcache = require('memory-cache');
const { body, validationResult } = require('express-validator');
const config = require('./config');
const { version } = require('./package.json');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');

const app = express();
const port = 8000;

// Add rate limiting middleware
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests, please try again later.' }
});

// 1. First, core middleware
app.use(limiter);
app.use(morgan('dev'));
app.use(express.json());

// Add cache middleware
const cache = (duration) => {
  return (req, res, next) => {
    const key = '__express__' + req.originalUrl || req.url;
    const cachedBody = mcache.get(key);

    if (cachedBody) {
      res.send(cachedBody);
      return;
    }

    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000); // Fix: Changed 100 to 1000 for proper milliseconds conversion
      res.sendResponse(body);
    };

    // Add cache control headers
    res.set('Cache-Control', `public, max-age=${duration}`);
    next();
  };
};

// Add validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Add storage for captured requests/responses
const requestStore = new Map();

// Middleware to capture requests
const captureRequest = async (req, res, next) => {
  const requestData = {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  };

  // Store original send
  const originalSend = res.send;
  res.send = function(body) {
    const responseData = {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: body
    };

    // Store the request/response pair
    const key = `${req.method}:${req.path}`;
    if (!requestStore.has(key)) {
      requestStore.set(key, []);
    }
    requestStore.get(key).push({ request: requestData, response: responseData });

    // Call original send
    originalSend.call(this, body);
  };

  next();
};

// Add capture middleware
app.use(captureRequest);

// Add external API recording functionality
const makeExternalRequest = async (url, method = 'GET', body = null, headers = {}) => {
  try {
    const response = await axios({
      url,
      method,
      data: body,
      headers,
      timeout: config.copyCat.defaultTimeout
    });
    return {
      status: response.status,
      headers: response.headers,
      body: response.data
    };
  } catch (error) {
    console.error(`External API error: ${error.message}`);
    throw error;
  }
};

// Add ML service management
let mlProcess = null;

const startMLService = () => {
  if (mlProcess) return;
  
  console.log('Starting ML service...');
  mlProcess = spawn('python', ['-m', 'uvicorn', 'ml.app:app', '--port', '8001'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  mlProcess.on('error', (err) => {
    console.error('Failed to start ML service:', err);
  });
};

// Add port check and cleanup
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, attempting to close existing connection...`);
        require('child_process').exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
          if (stdout) {
            const pid = stdout.split(/\s+/)[4];
            try {
              process.kill(Number(pid));
              console.log(`Killed process ${pid} using port ${port}`);
              resolve(true);
            } catch (e) {
              reject(new Error(`Could not free port ${port}. Please close it manually.`));
            }
          }
        });
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

// 2. All route definitions
// Modify routes to use cache
app.get('/', cache(2), (req, res) => {  // 2 seconds instead of 30
  res.json({
    message: 'Welcome to the API'
  });
});

app.get('/health', cache(3), (req, res) => {  // 3 seconds instead of 60
  res.json({
    status: 'healthy',
    version,
    environment: config.nodeEnv
  });
});

// Example validated route
app.post('/echo', [
  body('message').isString().trim().notEmpty(),
], validate, (req, res) => {
  console.log('Received request body:', req.body); // Add logging
  try {
    res.json({ echo: req.body.message });
  } catch (error) {
    console.error('Error in /echo:', error);
    next(error);
  }
});

// Add cache clear endpoint for admins
app.post('/clear-cache', (req, res) => {
  mcache.clear();
  res.json({ message: 'Cache cleared' });
});

// Test endpoint for rate limiting
app.get('/test-limit', (req, res) => {
  res.json({ message: 'Rate limit test endpoint' });
});

// Test endpoint with cache
app.get('/test-cache', cache(120), (req, res) => {
  res.json({ 
    message: 'Cached response',
    timestamp: new Date().toISOString()
  });
});

// Add Copy-Cat specific endpoints
app.post('/copy-cat/record', async (req, res) => {
  const { targetUrl, method = 'GET', headers = {} } = req.body;
  try {
    const externalResponse = await makeExternalRequest(targetUrl, method, req.body.data, headers);
    const key = `${method}:${new URL(targetUrl).pathname}`;
    
    if (!requestStore.has(key)) {
      requestStore.set(key, []);
    }
    
    requestStore.get(key).push({
      request: {
        url: targetUrl,
        method,
        headers,
        timestamp: new Date().toISOString()
      },
      response: externalResponse
    });

    res.json({ 
      message: 'API recorded successfully',
      target: targetUrl,
      method,
      status: externalResponse.status
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to record API',
      details: error.message
    });
  }
});

app.get('/copy-cat/recorded-apis', (req, res) => {
  const apis = Array.from(requestStore.keys());
  res.json({ recorded: apis });
});

// Fix replay endpoint
app.get('/copy-cat/replay/:apiPath*', (req, res) => {  // Changed from POST to GET
  const fullPath = req.params.apiPath + (req.params[0] || '');
  const key = `GET:/${fullPath}`;  // Always use GET for now
  console.log('Attempting replay:', key);

  if (!requestStore.has(key)) {
    return res.status(404).json({ 
      error: 'No recorded API found',
      attempted_key: key,
      available_keys: Array.from(requestStore.keys())
    });
  }

  const records = requestStore.get(key);
  const latest = records[records.length - 1];
  
  res.status(latest.response.status)
     .set(latest.response.headers)
     .send(latest.response.body);
});

// 3. Test endpoints
app.get('/quick-cache-test', cache(1), (req, res) => {  // Only 1 second cache
  res.json({ 
    message: 'Quick cache test',
    random: Math.random(),  // This helps verify if response is cached
    timestamp: new Date().toISOString()
  });
});

// Enhance debug endpoint
app.get('/copy-cat/debug', (req, res) => {
  res.json({
    requestStoreSize: requestStore.size,
    recordedPaths: Array.from(requestStore.keys()).map(key => ({
      key,
      recordCount: requestStore.get(key).length,
      lastRecorded: requestStore.get(key).slice(-1)[0]?.timestamp
    })),
    cacheKeys: mcache.keys(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Add ML health check endpoint
app.get('/ml/health', async (req, res) => {
  try {
    const response = await axios.get(`${config.copyCat.mlService.url}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'ML service not available',
      details: error.message 
    });
  }
});

// Modify server start
const startServer = async () => {
  try {
    await checkPort(config.port);
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      startMLService();
    });
  } catch (error) {
    console.error('Server start failed:', error.message);
    process.exit(1);
  }
};

startServer();

// 5. Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 6. 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Remove the problematic rate limit logging middleware that was here
