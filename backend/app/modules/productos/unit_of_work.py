from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    # Productos necesita leer categorías para validar 
    productos: ProductoRepository
    categorias: CategoriaRepository

    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)