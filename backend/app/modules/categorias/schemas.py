from typing import Any, Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel


def _limpiar_texto(valor: Any) -> Any:
    if isinstance(valor, str):
        return valor.strip()
    return valor


# ---------------- Entrada ----------------

class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100, schema_extra={"examples": ["Empanadas"]})
    descripcion: Optional[str] = Field(
        default=None, max_length=255, schema_extra={"examples": ["Empanadas al horno"]}
    )

    @field_validator("nombre", "descripcion", mode="before")
    @classmethod
    def limpiar(cls, valor: Any) -> Any:
        return _limpiar_texto(valor)


class CategoriaUpdate(SQLModel):
    # Todos opcionales
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)

    @field_validator("nombre", "descripcion", mode="before")
    @classmethod
    def limpiar(cls, valor: Any) -> Any:
        return _limpiar_texto(valor)

    @field_validator("nombre")
    @classmethod
    def nombre_no_nulo(cls, valor: Optional[str]) -> str:
        if valor is None:
            raise ValueError("El nombre no puede ser null")
        return valor


# ---------------- Salida ----------------

class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    activo: bool