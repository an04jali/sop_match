from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.analyze import router as analyze_router
from app.api.improve import router as improve_router
from app.api.history import router as history_router
from app.api.auth import router as auth_router
from app.db import init_db
from pathlib import Path
from fastapi.staticfiles import StaticFiles



app = FastAPI(
    title="Draftsman API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(improve_router)
app.include_router(upload_router)
app.include_router(analyze_router)
app.include_router(history_router)
app.include_router(auth_router)

# Serve Next.js frontend
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "out"

if FRONTEND_DIR.exists():
    app.mount(
        "/",
        StaticFiles(directory=FRONTEND_DIR, html=True),
        name="frontend"
    )