from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import QuickAnalysisRequest, QuickAnalysisResult, AIRecommendation

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/analyze", response_model=QuickAnalysisResult)
def analyze(req: QuickAnalysisRequest):
    risk = min(95, req.waitingDays * 15)
    return QuickAnalysisResult(
        sentiment="Negative" if risk > 50 else "Neutral",
        intent=req.requestType or "General Inquiry",
        urgency="High" if risk > 70 else "Medium",
        riskPercentage=risk,
        riskLevel="High Risk" if risk > 70 else "Medium Risk",
        status="At Risk" if risk > 70 else "Processing",
        whyAtRisk=["Request pending beyond SLA window"] if risk > 50 else [],
        recommendation=AIRecommendation(
            type="human_intervention" if risk > 70 else "normal_response",
            title="Human intervention recommended" if risk > 70 else "Normal response recommended",
            explanation="Placeholder explanation.",
            suggestedAction="Draft a personalized update.",
        ),
    )