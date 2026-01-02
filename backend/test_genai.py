import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'}")

if not api_key:
    exit(1)

genai.configure(api_key=api_key)

async def test():
    try:
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
        
        # Try gemini-pro as fallback
        print("\nTrying gemini-pro...")
        model = genai.GenerativeModel('gemini-pro')
        response = await model.generate_content_async("Say 'Hello World'")
        print(f"Response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
