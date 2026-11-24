from typing import Any, List, Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


def _limpiar_texto(valor: Any) -> Any:
    if isinstance(valor, str):
        return valor.strip()
    return valor


# ---------------- Entrada ----------------

class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=150, schema_extra={"examples": ["Empanada de carne"]})
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0, schema_extra={"examples": [1200.0]})
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0, schema_extra={"examples": [30]})
    disponible: bool = True
    categoria_id: int = Field(gt=0, schema_extra={"examples": [1]})

    @field_validator("nombre", "descripcion", "imagen_url", mode="before")
    @classmethod
    def limpiar(cls, valor: Any) -> Any:
        return _limpiar_texto(valor)


class ProductoUpdate(SQLModel):
    # Todos opcionales
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = Field(default=None, gt=0)

    @field_validator("nombre", "descripcion", "imagen_url", mode="before")
    @classmethod
    def limpiar(cls, valor: Any) -> Any:
        return _limpiar_texto(valor)

    @field_validator("nombre", "precio_base", "stock", "disponible", "categoria_id")
    @classmethod
    def obligatorio_no_nulo(cls, valor: Any) -> Any:
        if valor is None:
            raise ValueError("Este campo no puede ser null")
        return valor


class ProductoStockUpdate(SQLModel):
    # PATCH 
    stock: Optional[int] = Field(default=None, ge=0, schema_extra={"examples": [25]})
    disponible: Optional[bool] = Field(default=None, schema_extra={"examples": [True]})

    @field_validator("stock", "disponible")
    @classmethod
    def no_nulo(cls, valor: Any) -> Any:
        if valor is None:
            raise ValueError("Este campo no puede ser null")
        return valor


# ---------------- Salida ----------------

class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio_base: float
    imagen_url: Optional[str]
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: List[ProductoRead]