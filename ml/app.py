from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import spacy

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

class TextAnalysis(BaseModel):
    text: str

@app.get("/health")
def health_check():
    return {"status": "ML server running"}

@app.post("/analyze")
def analyze_text(data: TextAnalysis):
    doc = nlp(data.text)
    return {
        "tokens": len(doc),
        "sentences": len(list(doc.sents)),
        "entities": [(ent.text, ent.label_) for ent in doc.ents]
    }
