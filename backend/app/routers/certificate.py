from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
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

def get_font_for_text(text, size):
    """Get appropriate font based on text content"""
    # Check if text contains Devanagari Unicode characters
    is_hindi = any('\u0900' <= char <= '\u097F' for char in text)
    
    try:
        if is_hindi:
            return ImageFont.truetype("NotoSansDevanagari-Bold.ttf", size)
        else:
            return ImageFont.truetype("OldStandardTT-Bold.ttf", size)
    except:
        try:
            if is_hindi:
                return ImageFont.truetype("NotoSansDevanagari-Regular.ttf", size)
            else:
                return ImageFont.truetype("OldStandardTT-Regular.ttf", size)
        except:
            try:
                return ImageFont.truetype("arialbd.ttf", size)
            except:
                return ImageFont.load_default(size=size)

def get_fonts():
    """Load fonts matching frontend styles"""
    name_font = get_font_for_text("Sample")  # Default to English font
    marks_font = get_font_for_text("Sample")  # Default to English font
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
        # Load appropriate fonts based on text content
        name_font = get_font_for_text(name, 55)  # Use 45px size for name
        marks_font = get_font_for_text(marks, 38)  # Use 35px size for marks
        
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
            
            # Get original image dimensions
            img_width, img_height = img.size
            
            # Create PDF with same dimensions as original image
            pdf_buffer = io.BytesIO()
            c = canvas.Canvas(pdf_buffer, pagesize=(img_width, img_height))
            
            # Convert PIL Image to ReportLab ImageReader
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            pil_img = ImageReader(img_byte_arr)
            
            # Draw image at original size
            c.drawImage(pil_img, 0, 0, width=img_width, height=img_height)
            c.save()
            pdf_buffer.seek(0)
            
            return StreamingResponse(
                pdf_buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=Certificate.pdf"}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
