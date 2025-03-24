import express, { Request, Response, Router, RequestHandler, NextFunction, ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import mcache from 'memory-cache';
import axios from 'axios';

const app = express();

// Add rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later' }
});

// Apply rate limiting to all routes
app.use(limiter);
app.use(express.json());

// Add recording storage
interface RecordedRequest {
    method: string;
    path: string;
    headers: any;
    body: any;
    response: any;
    timestamp: number;
}

const recordings: RecordedRequest[] = [];

// Add recording middleware
const recordRequest = ((req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function(body): Response {
        recordings.push({
            method: req.method,
            path: req.path,
            headers: req.headers,
            body: req.body,
            response: body,
            timestamp: Date.now()
        });
        return originalSend.call(this, body);
    };
    next();
}) as RequestHandler;

interface User {
    id: string;
    name: string;
    [key: string]: any;
}

const users: { [key: string]: User } = {};

type ParamsWithId = { id: string };

const router = Router();

// Add cache middleware
const cache = (duration: number) => {
    return ((req: Request, res: Response, next: NextFunction) => {
        const key = '__express__' + req.originalUrl || req.url;
        const cachedBody = mcache.get(key);

        if (cachedBody) {
            res.send(cachedBody);
            return;
        }

        const originalSend = res.send;
        res.send = function(body): Response {
            mcache.put(key, body, duration * 1000);
            return originalSend.call(this, body);
        };

        next();
    }) as RequestHandler;
};

router.get('/health', cache(30), ((req: Request, res: Response) => {
    // Add artificial delay
    const start = Date.now();
    while (Date.now() - start < 100) {} // 100ms delay
    res.json('API is running');
}) as RequestHandler);

// Split validation into create and update
const validateCreateUser = ((req: Request, res: Response, next: NextFunction) => {
    const { id, name } = req.body;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Valid id is required' });
    }
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Valid name is required' });
    }
    next();
}) as RequestHandler;

const validateUpdateUser = ((req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Valid name is required' });
    }
    next();
}) as RequestHandler;

router.post('/users', validateCreateUser, ((req: Request, res: Response) => {
    const user: User = req.body;
    users[user.id] = user;
    res.json(user);
}) as RequestHandler);

router.get('/users/:id', cache(10), ((req: Request<ParamsWithId>, res: Response) => {
    const user = users[req.params.id];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
}) as RequestHandler<ParamsWithId>);

router.put('/users/:id', validateUpdateUser, ((req: Request<ParamsWithId>, res: Response) => {
    const user = users[req.params.id];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    users[req.params.id] = { ...user, ...req.body };
    res.json(users[req.params.id]);
}) as RequestHandler<ParamsWithId>);

router.delete('/users/:id', ((req: Request<ParamsWithId>, res: Response) => {
    delete users[req.params.id];
    res.status(204).send();
}) as RequestHandler<ParamsWithId>);

router.get('/users', cache(10), ((req: Request, res: Response) => {
    const { name } = req.query;
    if (name) {
        const filtered = Object.values(users).filter(user => 
            user.name.toLowerCase().includes(String(name).toLowerCase())
        );
        return res.json(filtered);
    }
    res.json(Object.values(users));
}) as RequestHandler);

// Add recording endpoints
router.get('/recordings', ((req: Request, res: Response) => {
    res.json(recordings);
}) as RequestHandler);

router.delete('/recordings', ((req: Request, res: Response) => {
    recordings.length = 0;
    res.status(204).send();
}) as RequestHandler);

// Add ML server endpoint
router.post('/ml/analyze', cache(30), (async (req: Request, res: Response) => {
    try {
        const mlResponse = await axios.post('http://localhost:8001/analyze', req.body);
        res.json(mlResponse.data);
    } catch (error) {
        res.status(500).json({ error: 'ML server error' });
    }
}) as RequestHandler);

// Add error logging middleware
const errorLogger = ((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`Error: ${err.message}`);
    next(err);
}) as ErrorRequestHandler;

// Apply recording middleware to all routes
app.use(recordRequest);
app.use(errorLogger);
app.use(router);

export function startServer(port: number = 3000) {
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(port, () => {
                console.log(`Server running on port ${port}`);
                resolve(server);
            });

            server.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}
