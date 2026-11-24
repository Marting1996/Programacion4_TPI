from typing import Optional

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ROL_POR_DEFECTO = "user"


# ---------------- Excepciones de dominio ----------------

class AuthError(Exception):
    pass


class CredencialesInvalidas(AuthError):
    def __init__(self) -> None:
        super().__init__("Usuario o contraseña incorrectos")


class CuentaDesactivada(AuthError):
    def __init__(self) -> None:
        # El frontend compara este texto 
        super().__init__("Cuenta de usuario desactivada")


# ---------------- Casos de uso ----------------

class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise UsuarioDuplicado("El username ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise UsuarioDuplicado("El email ya está registrado")
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=data.email,
                    hashed_password=hash_password(data.password),
                    role=ROL_POR_DEFECTO,
                )
            )
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        # Devuelve el JWT; el Router lo guarda en la cookie
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            # Mismo error si el usuario no existe o si la contraseña no coincide
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(subject=str(usuario.id))

    def obtener_usuario(self, usuario_id: int) -> Optional[UserPublic]:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            return UserPublic.model_validate(usuario) if usuario else None