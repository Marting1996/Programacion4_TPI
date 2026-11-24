from types import TracebackType
from typing import Callable, Optional, Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    def __init__(
        self, session_factory: Callable[[], Session] = default_session_factory
    ) -> None:
        self._session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self._session_factory()
        self._crear_repositorios()
        return self

    def __exit__(
        self,
        exc_type: Optional[type[BaseException]],
        exc: Optional[BaseException],
        tb: Optional[TracebackType],
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()

    def _crear_repositorios(self) -> None:
        raise NotImplementedError