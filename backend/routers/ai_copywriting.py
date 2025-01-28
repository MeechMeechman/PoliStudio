from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import subprocess
import json

router = APIRouter(prefix="/ai", tags=["ai"])

class ContentRequest(BaseModel):
    content_type: str  # 'flyer', 'social', 'email', etc.
    campaign_name: str
    target_audience: str
    key_points: List[str]
    tone: str = "professional"  # professional, casual, energetic, etc.
    # Specific fields for different content types
    size: Optional[str] = None  # for flyers: 'letter', 'a4', 'postcard'
    platform: Optional[str] = None  # for social: 'twitter', 'facebook', 'instagram'
    word_limit: Optional[int] = None

class ContentResponse(BaseModel):
    content: str
    suggestions: List[str]
    metadata: dict

def generate_prompt(request: ContentRequest) -> str:
    """Generate a detailed prompt based on the content type and requirements."""
    base_prompt = f"""You are an expert political campaign copywriter. Create compelling content for a {request.content_type} 
for the campaign '{request.campaign_name}'. The target audience is {request.target_audience}.
The tone should be {request.tone}. Include these key points: {', '.join(request.key_points)}.
"""
    
    if request.content_type == "flyer":
        base_prompt += f"\nThis is for a {request.size} size flyer. Include a suggested layout structure."
    elif request.content_type == "social":
        base_prompt += f"\nThis is for {request.platform}. Maximum length: {request.word_limit} characters."
        if request.platform == "twitter":
            base_prompt += "\nInclude hashtag suggestions."
    
    base_prompt += "\nProvide the content in a clear, structured format with sections for headline, main content, and call-to-action."
    
    return base_prompt

def run_ollama_query(prompt: str) -> str:
    """Execute Ollama query with qwen2.5:3b model."""
    try:
        cmd = [
            "ollama",
            "run",
            "qwen2.5:3b",
            prompt
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"AI model error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running AI query: {str(e)}")

@router.post("/generate", response_model=ContentResponse)
async def generate_content(request: ContentRequest):
    """Generate campaign content based on the specified parameters."""
    # Validate request parameters
    if request.content_type == "flyer" and not request.size:
        raise HTTPException(status_code=400, detail="Size is required for flyers")
    if request.content_type == "social" and not request.platform:
        raise HTTPException(status_code=400, detail="Platform is required for social media content")
    
    # Generate and send prompt to Ollama
    prompt = generate_prompt(request)
    ai_response = run_ollama_query(prompt)
    
    # Process and structure the response
    try:
        # Extract sections from AI response (you might need to adjust this based on actual output format)
        sections = ai_response.split("\n\n")
        content = sections[0] if sections else ai_response
        suggestions = []
        if len(sections) > 1:
            suggestions = [s.strip() for s in sections[1].split("\n") if s.strip()]
        
        metadata = {
            "content_type": request.content_type,
            "campaign_name": request.campaign_name,
            "target_audience": request.target_audience,
            "tone": request.tone
        }
        
        if request.content_type == "flyer":
            metadata["size"] = request.size
        elif request.content_type == "social":
            metadata["platform"] = request.platform
            metadata["word_limit"] = request.word_limit
        
        return ContentResponse(
            content=content,
            suggestions=suggestions,
            metadata=metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI response: {str(e)}")

@router.post("/flyer")
async def generate_flyer(
    campaign_name: str,
    target_audience: str,
    key_points: List[str],
    size: str = "letter",
    tone: str = "professional"
):
    """Convenience endpoint specifically for generating flyers."""
    request = ContentRequest(
        content_type="flyer",
        campaign_name=campaign_name,
        target_audience=target_audience,
        key_points=key_points,
        size=size,
        tone=tone
    )
    return await generate_content(request)

@router.post("/social")
async def generate_social_post(
    campaign_name: str,
    target_audience: str,
    key_points: List[str],
    platform: str,
    tone: str = "casual",
    word_limit: Optional[int] = None
):
    """Convenience endpoint specifically for generating social media posts."""
    # Set default word limits based on platform
    if not word_limit:
        limits = {
            "twitter": 280,
            "facebook": 500,
            "instagram": 300,
            "linkedin": 700
        }
        word_limit = limits.get(platform.lower(), 300)
    
    request = ContentRequest(
        content_type="social",
        campaign_name=campaign_name,
        target_audience=target_audience,
        key_points=key_points,
        platform=platform,
        tone=tone,
        word_limit=word_limit
    )
    return await generate_content(request) 