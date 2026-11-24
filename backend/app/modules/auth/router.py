from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, CurrentUser, get_auth_service
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from .schemas import MensajeResponse
from .service import AuthService, CredencialesInvalidas, CuentaDesactivada

router = APIRouter(prefix="/auth", tags=["auth"])

AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UserCreate, service: AuthServiceDep) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))


@router.post("/token", response_model=MensajeResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: AuthServiceDep,
) -> MensajeResponse:
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

    # El JWT viaja en una cookie HttpOnly
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response) -> MensajeResponse:
    # Responde con la cookie vencida: el navegador la borra
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: CurrentUser) -> UserPublic:
    return usuario