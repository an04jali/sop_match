from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.analyze import router as analyze_router
from app.api.improve import router as improve_router
from app.api.history import router as history_router
from app.db import init_db


app = FastAPI(
    title="Draftsman API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
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


@app.get("/")
def root():

    return {
        "message": "Draftsman API is running 🚀"
    }