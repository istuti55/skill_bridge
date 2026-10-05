from ollama import chat


DEFAULT_MODEL = "llama3:latest"


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Send a prompt to the local Ollama model."""

    response = chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]