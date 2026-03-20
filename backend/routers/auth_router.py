# routers/auth_router.py

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import db

router = APIRouter()
bearer = HTTPBearer(auto_error=False)

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY  = os.getenv("SECRET_KEY", "easylearn-super-secret-change-in-production")
ALGORITHM   = "HS256"
TOKEN_EXPIRE_DAYS = 30

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
users_col = db["users"]

# ── Models ────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name:     str
    email:    str
    password: str

class LoginRequest(BaseModel):
    email:    str
    password: str

class AuthResponse(BaseModel):
    token: str
    user:  dict

# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await users_col.find_one({"_id": user_id}, {"password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/signup", status_code=201)
async def signup(body: SignupRequest):
    existing = await users_col.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    from bson import ObjectId
    user_id = str(ObjectId())
    user_doc = {
        "_id":       user_id,
        "name":      body.name.strip(),
        "email":     body.email.lower().strip(),
        "password":  hash_password(body.password),
        "created_at": datetime.now(timezone.utc),
    }
    await users_col.insert_one(user_doc)
    token = create_token(user_id)
    return AuthResponse(
        token=token,
        user={"id": user_id, "name": user_doc["name"], "email": user_doc["email"]},
    )


@router.post("/login")
async def login(body: LoginRequest):
    user = await users_col.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_token(str(user["_id"]))
    return AuthResponse(
        token=token,
        user={"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    )


@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return {"id": str(current_user["_id"]), "name": current_user["name"], "email": current_user["email"]}
