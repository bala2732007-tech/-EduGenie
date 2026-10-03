import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def explain_topic(topic: str) -> str:
    """
    Explains the concept in a simple and clear way for a school student.
    Can run either locally with transformers or using Gemini API for cloud efficiency.
    """
    try:
        model = genai.GenerativeModel(model_name="gemini-1.5-pro")
        input_text = f"Explain the concept of '{topic}' in a simple and clear way for a school student."
        response = model.generate_content(input_text)
        return response.text.strip()
    except Exception as e:
        return f"⚠️ Error in Explanation: {e}"
