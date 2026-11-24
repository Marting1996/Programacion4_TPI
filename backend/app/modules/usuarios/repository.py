from typing import Optional

from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from .models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Optional[Usuario]:
        # Sin distinguir mayúsculas
        consulta = select(Usuario).where(
            func.lower(Usuario.username) == username.strip().lower()
        )
        return self.session.exec(consulta).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        consulta = select(Usuario).where(
            func.lower(Usuario.email) == email.strip().lower()
        )
        return self.session.exec(consulta).first()