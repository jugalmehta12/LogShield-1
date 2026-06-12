from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class LogRead(BaseModel):
    id: int
    timestamp: datetime
    source: str
    event_type: str
    severity: str
    raw_log: str

    model_config = {"from_attributes": True}
