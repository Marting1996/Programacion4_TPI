from typing import Annotated, Callable, List, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    # lee el token de la cookie
    async def __call__(self, request: Request) -> Optional[str]:
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autenticado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserPublic:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión inválida o expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credenciales_invalidas
    try:
        usuario_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise credenciales_invalidas
    # El usuario se lee de la base en cada petición
    usuario = service.obtener_usuario(usuario_id)
    if usuario is None:
        raise credenciales_invalidas
    return usuario


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


def require_role(roles_permitidos: List[str]) -> Callable[..., UserPublic]:
    def verificar_rol(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return verificar_rol


# Atajos 
CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]