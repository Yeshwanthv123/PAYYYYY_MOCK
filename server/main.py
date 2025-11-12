import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .database import SessionLocal, init_db
from . import models

# Initialize DB (create tables if not exist)
init_db()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    email: str
    password: str

class PalmRegisterRequest(BaseModel):
    user_id: str
    landmarks: list

class PalmVerifyRequest(BaseModel):
    user_id: str
    landmarks: list


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get('/health')
def health():
    return {"ok": True}

@app.post('/auth/signup')
def signup(body: AuthRequest, db: Session = Depends(get_db)):
    # check exists
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if user:
        raise HTTPException(status_code=400, detail='Email already registered')

    hashed = pwd_context.hash(body.password)
    new = models.User(email=body.email, password_hash=hashed)
    db.add(new)
    db.commit()
    db.refresh(new)
    return {"user": {"id": str(new.id), "email": new.email}}

@app.post('/auth/signin')
def signin(body: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=400, detail='Invalid credentials')
    if not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(status_code=400, detail='Invalid credentials')
    return {"user": {"id": str(user.id), "email": user.email}}

@app.get('/palm/status')
def palm_status(user_id: str, db: Session = Depends(get_db)):
    exists = db.query(models.PalmData).filter(models.PalmData.user_id == user_id).first()
    return {"hasRegistered": bool(exists)}

@app.post('/palm/register')
def palm_register(body: PalmRegisterRequest, db: Session = Depends(get_db)):
    # upsert: if exists update else create
    existing = db.query(models.PalmData).filter(models.PalmData.user_id == body.user_id).first()
    if existing:
        existing.landmarks_json = body.landmarks
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return {"ok": True}

    new = models.PalmData(user_id=body.user_id, landmarks_json=body.landmarks)
    db.add(new)
    db.commit()
    db.refresh(new)
    return {"ok": True}

def calculate_cosine_similarity(a, b):
    try:
        if not isinstance(a, list) or not isinstance(b, list):
            return 0.0
        if len(a) != len(b):
            return 0.0
        flatA = []
        flatB = []
        for p in a:
            flatA.extend([p.get('x'), p.get('y'), p.get('z')])
        for p in b:
            flatB.extend([p.get('x'), p.get('y'), p.get('z')])
        dot = sum(x * y for x, y in zip(flatA, flatB))
        magA = sum(x * x for x in flatA) ** 0.5
        magB = sum(y * y for y in flatB) ** 0.5
        if magA == 0 or magB == 0:
            return 0.0
        return dot / (magA * magB)
    except Exception:
        return 0.0

@app.post('/palm/verify')
def palm_verify(body: PalmVerifyRequest, db: Session = Depends(get_db)):
    stored = db.query(models.PalmData).filter(models.PalmData.user_id == body.user_id).first()
    if not stored:
        raise HTTPException(status_code=404, detail='No palm data registered')
    similarity = calculate_cosine_similarity(body.landmarks, stored.landmarks_json)
    is_verified = similarity >= 0.85
    return {"isVerified": is_verified, "similarity": similarity}
