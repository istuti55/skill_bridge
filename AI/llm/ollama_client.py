from ollama import Client


DEFAULT_MODEL = "llama3.2:latest"

OLLAMA_HOST = "http://127.0.0.1:11434"

OLLAMA_TIMEOUT = 300.0


client = Client(
    host=OLLAMA_HOST,
    timeout=OLLAMA_TIMEOUT
)


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Send a prompt to the local Ollama model."""

    response = client.chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]