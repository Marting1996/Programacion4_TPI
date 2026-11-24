from typing import Optional, Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, Sequence[Producto]]:
        # Devuelve total, items
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()

        consulta = (
            select(Producto)
            .where(*filtros)
            # Trae la categoría de todos los productos en una sola consulta extra
            .options(selectinload(Producto.categoria))  
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        )
        return total, self.session.exec(consulta).all()