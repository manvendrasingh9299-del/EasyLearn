import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral:instruct"


def generate_summary(prompt: str):

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)

    result = response.json()

    return result["response"]
    