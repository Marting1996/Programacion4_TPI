from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository
from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    # Pedidos y productos comparten la MISMA sesión
    pedidos: PedidoRepository
    productos: ProductoRepository

    def _crear_repositorios(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)