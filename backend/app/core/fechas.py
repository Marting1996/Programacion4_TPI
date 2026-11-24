from datetime import datetime, timezone


def ahora() -> datetime:
    # Fecha y hora
    return datetime.now(timezone.utc)