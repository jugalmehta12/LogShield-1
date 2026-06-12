from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AlertRead(BaseModel):
    id: int
    alert_type: str
    severity: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
