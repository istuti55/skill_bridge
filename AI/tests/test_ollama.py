from core.ollama_client import call_ollama


def main():
    prompt = """
You are the AI assistant for SkillBridge.

Reply with exactly:
SkillBridge AI is working.
"""

    response = call_ollama(prompt)

    print("\n===== OLLAMA RESPONSE =====")
    print(response)


if __name__ == "__main__":
    main()