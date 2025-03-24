# Start ML server in background
Start-Process -NoNewWindow powershell -ArgumentList ".\venv\Scripts\Activate; uvicorn ml.app:app --port 8001"

# Start Node.js server
npm test
