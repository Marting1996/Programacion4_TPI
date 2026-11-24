from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


# ---------------- Entrada ----------------

class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50, schema_extra={"examples": ["ana"]})
    full_name: str = Field(min_length=1, max_length=120, schema_extra={"examples": ["Ana García"]})
    email: EmailStr = Field(max_length=255, schema_extra={"examples": ["ana@gmail.com"]})
    password: str = Field(min_length=8, max_length=72, schema_extra={"examples": ["Secreta123"]})

    @field_validator("username", "full_name")
    @classmethod
    def sin_espacios_extremos(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("No puede estar vacío ni contener solo espacios")
        return valor

    @field_validator("email")
    @classmethod
    def email_en_minusculas(cls, valor: str) -> str:
        return valor.strip().lower()

    @field_validator("password")
    @classmethod
    def password_max_72_bytes(cls, valor: str) -> str:
        if len(valor.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return valor


# ---------------- Salida ----------------

class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime