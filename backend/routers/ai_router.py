from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx
import json

router = APIRouter(prefix="/ai", tags=["AI Tools"])

class ContentRequest(BaseModel):
    campaign_name: str = Field(..., description="Name of the campaign")
    target_audience: str = Field(..., description="Target audience for the content")
    key_points: List[str] = Field(..., description="Key points to include in the content")
    tone: str = Field(..., description="Desired tone of the content")
    size: Optional[str] = Field(None, description="Size of the flyer (letter, a4, postcard)")
    platform: Optional[str] = Field(None, description="Social media platform")
    word_limit: Optional[int] = Field(None, description="Word limit for the content")

class ContentResponse(BaseModel):
    content: str = Field(..., description="The generated content")
    suggestions: List[str] = Field(default_factory=list, description="List of improvement suggestions")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Sample campaign content...",
                "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
            }
        }

def generate_prompt(request: ContentRequest, content_type: str) -> str:
    base_prompt = f"""You are an expert political campaign copywriter. Create compelling {content_type} content for:

Campaign: {request.campaign_name}
Target Audience: {request.target_audience}
Tone: {request.tone}

Key Points to Include:
{chr(10).join(f'- {point}' for point in request.key_points)}

"""

    if content_type == "flyer":
        base_prompt += f"""
Format: {request.size} size flyer
Guidelines:
- Create a clear headline that grabs attention
- Organize content in a scannable format
- Include a strong call-to-action
- Maintain appropriate length for {request.size} size
"""
    else:  # social media
        base_prompt += f"""
Platform: {request.platform}
Word Limit: {request.word_limit if request.word_limit else 'Platform standard'}
Guidelines:
- Create engaging, platform-appropriate content
- Use relevant hashtags where appropriate
- Include a clear call-to-action
- Optimize for {request.platform}'s best practices
"""

    base_prompt += """
Please provide your response in the following JSON format:
{{
    "content": "Your generated content here",
    "suggestions": [
        "First suggestion here",
        "Second suggestion here",
        "Third suggestion here"
    ]
}}

Important: Ensure your response is valid JSON with proper escaping of quotes and special characters."""

    return base_prompt

async def run_ollama_query(prompt: str) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:3b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=45
            )
            response.raise_for_status()
            
            # Extract the response text
            result = response.json()
            response_text = result["response"]
            
            # Parse the JSON response
            try:
                content_data = json.loads(response_text)
                if not isinstance(content_data, dict):
                    raise json.JSONDecodeError("Invalid response format", response_text, 0)
                return content_data
            except json.JSONDecodeError:
                # If JSON parsing fails, create a basic response
                return {
                    "content": response_text,
                    "suggestions": ["Consider adjusting the tone", "Try different formatting", "Add more specific details"]
                }
                
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error calling Ollama API: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing AI response: {str(e)}")

@router.post("/flyer", response_model=ContentResponse)
async def generate_flyer(request: ContentRequest):
    if not request.size:
        raise HTTPException(status_code=400, detail="Size is required for flyer generation")
    
    prompt = generate_prompt(request, "flyer")
    result = await run_ollama_query(prompt)
    
    return ContentResponse(
        content=result["content"],
        suggestions=result["suggestions"]
    )

@router.post("/social", response_model=ContentResponse)
async def generate_social_post(request: ContentRequest):
    if not request.platform:
        raise HTTPException(status_code=400, detail="Platform is required for social media content")
    
    prompt = generate_prompt(request, "social media post")
    result = await run_ollama_query(prompt)
    
    return ContentResponse(
        content=result["content"],
        suggestions=result["suggestions"]
    ) 