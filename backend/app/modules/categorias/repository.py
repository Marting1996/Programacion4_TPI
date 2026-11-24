from typing import Optional, Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        # Busca entre TODAS
        consulta = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.strip().lower()
        )
        return self.session.exec(consulta).first()

    def list_activas(self) -> Sequence[Categoria]:
        consulta = (
            select(Categoria)
            .where(col(Categoria.activo).is_(True))
            .order_by(col(Categoria.nombre))
        )
        return self.session.exec(consulta).all()