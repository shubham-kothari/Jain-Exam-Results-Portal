from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw, ImageFont
import io
import os

router = APIRouter(
    prefix="/certificate",
    tags=["certificate"]
)

# Certificate template path
CERTIFICATE_TEMPLATE_PATH = os.path.join(
    os.path.dirname(__file__), 
    "../../../frontend/src/photo/Certificate.png"
)

def get_fonts():
    """Try to load preferred fonts, fallback to defaults"""
    try:
        name_font = ImageFont.truetype("OldStandardTT-Regular.ttf", 42)
        marks_font = ImageFont.truetype("OldStandardTT-Regular.ttf", 18)
    except:
        try:
            name_font = ImageFont.truetype("arial.ttf", 42)
            marks_font = ImageFont.truetype("arial.ttf", 42)
        except:
            name_font = ImageFont.load_default()
            marks_font = ImageFont.load_default()
    return name_font, marks_font

def calculate_positions(img_width, img_height):
    """Calculate text positions based on percentages from frontend"""
    name_x = int(img_width * 0.42)  # 15% from top
    name_y = int(img_height * 0.37)  # 15% from top

    marks_x = int(img_width * 0.575)  # 4.8% below name
    marks_y = int(img_height * 0.523)  # 4.8% below name

    return {
        'name': (name_x, name_y),  # 10% from left
        'marks': (marks_x, marks_y)  # 10% from left
    }

@router.post("/generate")
async def generate_certificate(name: str, marks: str):
    try:
        # Load fonts
        name_font, marks_font = get_fonts()
        
        # Open certificate template
        with Image.open(CERTIFICATE_TEMPLATE_PATH) as img:
            draw = ImageDraw.Draw(img)
            
            # Calculate positions
            positions = calculate_positions(img.width, img.height)
            
            # Draw name and marks with different styles
            draw.text(
                positions['name'], 
                name, 
                font=name_font, 
                fill=(6, 6, 132)  # Dark blue
            )
            draw.text(
                positions['marks'], 
                marks, 
                font=marks_font, 
                fill=(0, 0, 0)  # Black
            )
            
            # Save to bytes buffer
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            return StreamingResponse(img_byte_arr, media_type="image/png")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
