from datetime import datetime
from typing import Any, List, Literal, Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]


# ---------------- Entrada ----------------

class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0, schema_extra={"examples": [1]})
    cantidad: int = Field(ge=1, schema_extra={"examples": [2]})


class PedidoCreate(SQLModel):
    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(
        min_length=5, max_length=200, schema_extra={"examples": ["Av. San Martín 1234"]}
    )
    notas: Optional[str] = Field(
        default=None, max_length=500, schema_extra={"examples": ["Tocar timbre 2B"]}
    )

    @field_validator("direccion_entrega", "notas", mode="before")
    @classmethod
    def limpiar(cls, valor: Any) -> Any:
        return valor.strip() if isinstance(valor, str) else valor

    @field_validator("notas")
    @classmethod
    def notas_vacias_a_none(cls, valor: Optional[str]) -> Optional[str]:
        return valor or None


class CambioEstado(SQLModel):
    estado: EstadoPedido


# ---------------- Salida ----------------

class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str]
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float