from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=120)
    email: str = Field(max_length=255, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    # "user" o "admin". El registro público siempre crea "user"
    role: str = Field(default="user", max_length=20)
    # Baja lógica: disabled = True
    disabled: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=ahora, sa_type=DateTime(timezone=True), nullable=False
    )

    # Usuario 1:N Pedido
    pedidos: List["Pedido"] = Relationship(back_populates="usuario")