from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_database_url(database_url: str) -> str:
    normalized = database_url.strip()
    if normalized.startswith("postgres://"):
        return "postgresql+psycopg://" + normalized[len("postgres://"):]
    if normalized.startswith("postgresql://"):
        return "postgresql+psycopg://" + normalized[len("postgresql://"):]
    return normalized


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Inventory & Order Management System"
    api_prefix: str = "/api"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    database_url: str = Field(default="postgresql+psycopg://postgres:postgres@localhost:5432/inventory_db", alias="DATABASE_URL")
    postgres_db: str | None = Field(default=None, alias="POSTGRES_DB")
    postgres_user: str | None = Field(default=None, alias="POSTGRES_USER")
    postgres_password: str | None = Field(default=None, alias="POSTGRES_PASSWORD")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    frontend_port: int = Field(default=3000, alias="FRONTEND_PORT")
    cors_origins: str = Field(default="http://localhost:3000")
    low_stock_threshold: int = Field(default=5, alias="LOW_STOCK_THRESHOLD")

    @property
    def cors_origin_list(self) -> list[str]:
        if not self.cors_origins.strip():
            return ["http://localhost:3000"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def model_post_init(self, __context) -> None:
        self.database_url = _normalize_database_url(self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()