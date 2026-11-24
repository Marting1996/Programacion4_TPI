from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        usuario_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> tuple[int, Sequence[Pedido]]:
        # usuario_id = None lista los pedidos de TODOS 
        filtros = []
        if usuario_id is not None:
            filtros.append(col(Pedido.usuario_id) == usuario_id)
        if estado is not None:
            filtros.append(col(Pedido.estado) == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()

        consulta = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))  
            # Los más recientes primero
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, self.session.exec(consulta).all()

    def count_by_estado(self) -> dict[str, int]:
        consulta = select(Pedido.estado, func.count()).group_by(col(Pedido.estado))
        return {estado: cantidad for estado, cantidad in self.session.exec(consulta).all()}

    def count_desde(self, desde: datetime) -> int:
        # Pedidos creados a partir de una fecha 
        consulta = (
            select(func.count())
            .select_from(Pedido)
            .where(col(Pedido.created_at) >= desde)
        )
        return self.session.exec(consulta).one()

    def sum_total_by_estado(self, estado: str) -> float:
        # coalesce: si no hay pedidos, SUM devuelve NULL y lo cambiamos por 0
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            col(Pedido.estado) == estado
        )
        return float(self.session.exec(consulta).one())