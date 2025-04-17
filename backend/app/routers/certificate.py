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
    "../data/Certificate.png"
)

def get_fonts():
    """Load fonts matching frontend styles"""
    try:
        # Try to load semi-bold variant first
        name_font = ImageFont.truetype("OldStandardTT-Bold.ttf", 45)
        marks_font = ImageFont.truetype("OldStandardTT-Bold.ttf", 35)  # Increased from 18 to 24
    except:
        try:
            # Fallback to regular if semi-bold not available
            name_font = ImageFont.truetype("OldStandardTT-Regular.ttf", 45)
            marks_font = ImageFont.truetype("OldStandardTT-Regular.ttf", 35)  # Increased from 18 to 24
        except:
            try:
                # Final fallback to Arial Bold
                name_font = ImageFont.truetype("arialbd.ttf", 45)
                marks_font = ImageFont.truetype("arialbd.ttf", 35)  # Increased from 18 to 24
            except:
                # Absolute fallback to default
                name_font = ImageFont.load_default()
                marks_font = ImageFont.load_default()
    return name_font, marks_font

def calculate_positions(img_width, img_height):
    """Calculate exact positions matching frontend layout"""
    # Name position - perfectly centered
    name_x = int(img_width * 0.5)  # Center horizontally
    name_y = int(img_height * 0.37)  # 35% from top
    
    # Marks position - 10% from left, 48% from top (matches frontend exactly)
    marks_x = int(img_width * 0.58)  # 10% from left
    marks_y = int(img_height * 0.54)  # 48% from top
    
    return {
        'name': (name_x, name_y),
        'marks': (marks_x, marks_y)
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
            # Calculate text width for perfect centering
            text_width = name_font.getlength(name)
            draw.text(
                (img.width/2 - text_width/2, positions['name'][1]),  # Center horizontally based on text length
                name, 
                font=name_font, 
                fill=(6, 6, 132)  # Dark blue
            )
            draw.text(
                positions['marks'], 
                marks, 
                font=marks_font, 
                fill=(6, 6, 132),  # Same dark blue as name
                anchor="mm"  # Center text at position
            )
            
            # Save to bytes buffer
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            return StreamingResponse(img_byte_arr, media_type="image/png")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
