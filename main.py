from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    id: str
    name: str

users = {}  # Mock database

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.post("/users")
async def create_user(user: User):
    users[user.id] = user
    return user

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    return users[user_id]

@app.put("/users/{user_id}")
async def update_user(user_id: str, user: User):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id != user.id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    users[user_id].name = user.name  # Only update the name
    return users[user_id]

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    deleted_user = users.pop(user_id)
    return {
        "status": "success",
        "message": "User deleted",
        "data": {"id": deleted_user.id, "name": deleted_user.name}
    }
