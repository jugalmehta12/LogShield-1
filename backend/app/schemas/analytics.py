from __future__ import annotations

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_logs: int
    total_alerts: int
    open_alerts: int
    critical_logs: int

    model_config = {"from_attributes": True}


class SeverityStats(BaseModel):
    severity: str
    count: int

    model_config = {"from_attributes": True}


class SourceStats(BaseModel):
    source: str
    count: int

    model_config = {"from_attributes": True}


class AlertTimeline(BaseModel):
    date: str
    count: int

    model_config = {"from_attributes": True}
