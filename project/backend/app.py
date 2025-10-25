from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, admin, documents, flashcards, user_stats

app = FastAPI(title="JUNEWRLD API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["flashcards"])
app.include_router(user_stats.router, prefix="/api/user", tags=["user"])

@app.get("/")
async def root():
    return {"message": "JUNEWRLD API is running"}