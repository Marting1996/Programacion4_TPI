from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Lee las variables del archivo .env (ubicado en la carpeta backend/)
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Base de datos
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS: origen del frontend (Vite)
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # En producción con HTTPS va en True para que la cookie viaje solo cifrada
    COOKIE_SECURE: bool = False


settings = Settings()