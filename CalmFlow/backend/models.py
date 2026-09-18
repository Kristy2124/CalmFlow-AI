from pydantic import BaseModel
from typing import Optional, List

class QuickAnalysisRequest(BaseModel):
    emailText: str
    clientName: str
    waitingDays: int
    requestType: Optional[str] = None

class AIRecommendation(BaseModel):
    type: str
    title: str
    explanation: str
    suggestedAction: str
    riskWarning: Optional[str] = None

class QuickAnalysisResult(BaseModel):
    sentiment: str
    intent: str
    urgency: str
    riskPercentage: int
    riskLevel: str
    status: str
    whyAtRisk: List[str]
    recommendation: AIRecommendation