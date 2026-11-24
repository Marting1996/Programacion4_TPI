from typing import List

from .models import Usuario
from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


# ---------------- Excepciones de dominio ----------------

class UsuarioError(Exception):
    pass


class UsuarioNoEncontrado(UsuarioError):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"Usuario {usuario_id} no encontrado")


class UsuarioDuplicado(UsuarioError):
    pass


class OperacionNoPermitida(UsuarioError):
    pass


# ---------------- Casos de uso (solo admin) ----------------

class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> List[UserPublic]:
        # Incluye a los desactivados
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._buscar(uow, usuario_id)
            usuario.disabled = False
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise OperacionNoPermitida("No podés desactivar tu propia cuenta")
        with self.uow as uow:
            usuario = self._buscar(uow, usuario_id)
            # Baja lógica
            usuario.disabled = True
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    @staticmethod
    def _buscar(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario