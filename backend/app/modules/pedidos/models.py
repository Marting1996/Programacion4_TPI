from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    # PENDIENTE, EN_PREPARACION, ENTREGADO o CANCELADO
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    # EFECTIVO o TRANSFERENCIA
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)
    total: float = Field(default=0)
    created_at: datetime = Field(
        default_factory=ahora, sa_type=DateTime(timezone=True), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=ahora,
        sa_type=DateTime(timezone=True),
        nullable=False,
        sa_column_kwargs={"onupdate": ahora},
    )

    # Usuario 1:N Pedido
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido 
    items: List["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "DetallePedido.id",
        },
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    producto_id: int = Field(foreign_key="productos.id", index=True)
    # >= 1: se valida en el schema
    cantidad: int
    # Copias del producto al momento de la compra (RN-05)
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    # precio_unitario * cantidad
    subtotal: float

    # Pedido 1:N DetallePedido
    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    # Producto 1:N DetallePedido
    producto: Optional["Producto"] = Relationship(back_populates="detalles")