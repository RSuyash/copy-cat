from fastapi import FastAPI
from app.api.endpoints import text_analysis, style_comparison, text_generation

app = FastAPI(
    title="Copy-Cat API",
    description="API for text style analysis and generation",
    version="1.0.0"
)

# Include routers
app.include_router(text_analysis.router, prefix="/api/v1/analyze", tags=["analysis"])
app.include_router(style_comparison.router, prefix="/api/v1/compare", tags=["comparison"])
app.include_router(text_generation.router, prefix="/api/v1/generate", tags=["generation"])

@app.get("/")
async def root():
    return {"message": "Welcome to Copy-Cat API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": app.version
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
