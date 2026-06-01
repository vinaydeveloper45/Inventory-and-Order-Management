from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.middleware.request_id import RequestIdMiddleware
from app.models import *  # noqa: F401,F403

app = FastAPI(title=settings.app_name, version="1.0.0", docs_url="/docs", redoc_url="/redoc")
app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://inventory-and-order-management-h41hk0hf2-vinay-s-projects26.vercel.app",
        "http://localhost:3000",  # for local testing
        "http://localhost:5173",  # for local Vite dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.message})


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_: Request, exc: IntegrityError):
    message = str(exc.orig).lower()
    if "unique" in message and "sku" in message:
        return JSONResponse(status_code=409, content={"message": "SKU already exists"})
    if "unique" in message and "email" in message:
        return JSONResponse(status_code=409, content={"message": "Email already exists"})
    return JSONResponse(status_code=409, content={"message": "Database constraint violation"})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"message": "Validation error", "details": exc.errors()})


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"message": "Internal Server Error:"})


@app.get("/")
def root():
    return {"message": "Inventory & Order Management System API"}


app.include_router(api_router, prefix=settings.api_prefix)
