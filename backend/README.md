# Backend

FastAPI + SQLAlchemy + Alembic backend for the Inventory & Order Management System.

## Setup

1. Create a virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Run migrations with `alembic upgrade head`.
5. Start the app with `uvicorn app.main:app --reload`.

## Seed Data

Run `python -m app.utils.seed` after migrations to seed sample products, customers, and an order.

## Tests

Run `pytest` from the backend directory.
