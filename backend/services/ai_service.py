def generate_summary(text: str):

    topic = text[:80].replace("\n", " ")

    return {
        "topic": topic,
        "important_points": [
            "Academic content extracted",
            "Structured processing applied",
            "Revision-friendly format generated"
        ],
        "key_concepts": [
            "Concept A",
            "Concept B",
            "Concept C"
        ],
        "simple_explanation": "This document explains academic concepts in structured form.",
        "exam_summary": "Focus on definitions, core ideas, and structured bullet points."
    }

    
