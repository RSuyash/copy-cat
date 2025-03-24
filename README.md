# Copy-Cat API Server

A flexible API mocking server that can record, cache, and replay API responses.

## Project Roadmap

### Phase 1: Project Setup and Data Acquisition ⏳ (In Progress)
- [x] Initial Express server setup
- [x] Basic middleware integration
- [x] Rate limiting implementation
- [x] Caching system
- [x] Request/Response recording
- [ ] Python environment setup
- [ ] Data source integration (Gutenberg, Reuters, Enron)
- [ ] Data cleaning pipeline

### Phase 2: Frontend and Backend Development 🔄 (Next)
- [ ] Python backend (Flask/FastAPI)
- [ ] Frontend UI development
- [ ] API integration
- [ ] Style analysis endpoints
- [ ] Text comparison features

### Phase 3: Stylometric Analysis 📊 (Planned)
- [ ] Feature extraction implementation
- [ ] BERT embeddings integration
- [ ] Feature analysis and selection
- [ ] Classification system (target: 85% accuracy)

### Phase 4: Model Training 🤖 (Planned)
- [ ] GPT-2 model integration
- [ ] Fine-tuning pipeline
- [ ] Text generation system
- [ ] Style comparison logic

### Phase 5: Evaluation and Deployment 🚀 (Planned)
- [ ] Evaluation metrics implementation
- [ ] Performance optimization
- [ ] Documentation
- [ ] Cloud deployment

## Current Status

### Completed Features

### 1. Rate Limiting ✅
- Configurable request limits per time window
- Rate limit headers in responses
- Custom error messages for limit exceeded
- Configuration via `config.js`

### 2. Caching System ✅
- In-memory cache storage
- Configurable cache duration per route
- Cache headers support
- Cache clearing endpoint
- Cache status monitoring

### 3. Request/Response Recording ✅
- Captures all incoming requests
- Stores request metadata and responses
- Supports multiple recordings per endpoint
- Debug endpoint for monitoring
- Request store management

## API Endpoints

### Core Endpoints
- `GET /` - Welcome message
- `GET /health` - Server health status
- `POST /echo` - Echo service with validation

### Copy-Cat Specific
- `POST /copy-cat/record` - Start recording an API
- `GET /copy-cat/recorded-apis` - List recorded APIs
- `GET /copy-cat/replay/:apiPath*` - Replay recorded responses
- `GET /copy-cat/debug` - System status and debug info

### Test Endpoints
- `GET /test-limit` - Test rate limiting
- `GET /test-cache` - Test caching (120s)
- `GET /quick-cache-test` - Quick cache test (1s)

## Configuration

See `config.js` for customizable options:
- Rate limiting settings
- Environment variables
- Storage paths
- Cache settings

## Testing

Use `test.ps1` to run automated tests for all features:
- Health check
- Cache recording
- API listing
- Response replay
- Cache verification
- New API recording

## Performance Targets
- Style Classification Accuracy: >85%
- BLEU Scores: >0.3
- Style Comparison Accuracy: >80%

## Technology Stack
### Currently Implemented
- Node.js & Express
- Memory Cache
- Rate Limiting
- Request Capture & Replay

### Planned Integration
- Python (NLTK, SpaCy, Transformers)
- Frontend (React/Vue)
- Machine Learning Pipeline
- Database Integration

## Next Steps
1. Complete Python environment setup
2. Begin data collection phase
3. Implement data cleaning pipeline
4. Start frontend development

## Version History

### v1.0.0
- ✅ Basic Express server setup
- ✅ Rate limiting implementation
- ✅ Caching system with configurable durations
- ✅ Request/Response recording and replay
- ✅ Debug and monitoring endpoints
- ✅ Automated testing suite

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/yourusername/copy-cat.git
cd copy-cat
```

2. Install Node.js dependencies
```bash
npm install
```

3. Set up Python environment (requires Python 3.8+)
```bash
npm run setup
# or manually:
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Unix
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

4. Start both servers
```bash
npm run dev
```

### Python Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Unix:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install SpaCy model
python -m spacy download en_core_web_sm

# Start ML server
uvicorn ml.app:app --reload --port 8001
```

# Copy-Cat API

A simple RESTful API for managing users with TypeScript and Express.

## Features

- CRUD operations for users
- Input validation
- Query parameter filtering
- Error logging
- Automated tests

## Setup

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Users
- `GET /users` - Get all users (optional query param: name)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Request Examples

### Create User
```json
POST /users
{
    "id": "user-123",
    "name": "John Doe"
}
```

### Update User
```json
PUT /users/user-123
{
    "name": "Jane Doe"
}
```

### Filter Users
```
GET /users?name=Jane
```

## Response Examples

### Success
```json
{
    "id": "user-123",
    "name": "John Doe"
}
```

### Error
```json
{
    "error": "User not found"
}
```

## Testing

The project includes automated tests for all endpoints. Run:
```bash
npm test
```
