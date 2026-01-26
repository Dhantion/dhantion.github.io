
from PIL import Image
import os

def crop_and_zoom_logo(input_path, output_path):
    try:
        img = Image.open(input_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        # Get the bounding box of the non-zero regions
        # This effectively trims transparent borders
        bbox = img.getbbox()
        
        if bbox:
            # Crop to the bounding box
            cropped_img = img.crop(bbox)
            
            # If the user says "zoomlasana white background gozukuyo", 
            # maybe the image has white background instead of transparency?
            # Let's try to remove white background if it's not transparent
            # Convert white pixels to transparent to be safe? 
            # Or just assume getbbox worked if it was transparent.
            # If it was white background, getbbox might not have trimmed it if it's solid white.
            
            # Let's check for white background trimming explicitly
            # Create a mask where white is transparent
            # This is risky if the logo has white parts. 
            # User said "beyaz arkaplan gozukuyo".
            
            # Simple approach: save the bbox cropped version first.
            # Next.js app directory handles icon.png automatically.
            
            # Resize to standard icon size (e.g., 512x512) to ensure high quality display
            # But keep aspect ratio? Icons should be square generally.
            
            # Let's make it square by adding transparency padding if needed, 
            # or just resize if it's close to square.
            
            # Strategy: Crop tightly, then paste into a square canvas
            
            w, h = cropped_img.size
            max_dim = max(w, h)
            
            # Create a square new image
            new_img = Image.new('RGBA', (max_dim, max_dim), (255, 255, 255, 0))
            
            # Center the cropped image
            offset = ((max_dim - w) // 2, (max_dim - h) // 2)
            new_img.paste(cropped_img, offset)
            
            # Save as PNG
            new_img.save(output_path, 'PNG')
            print(f"Successfully processed logo to {output_path}")
            
        else:
            print("Could not find bounding box (empty image?)")
            
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    # Input: public/logo.png
    # Output: src/app/icon.png (Next.js magic file for favicon)
    
    input_file = r"d:\AI\ride-share-app\public\logo.png"
    output_file = r"d:\AI\ride-share-app\src\app\icon.png"
    
    # Check if input exists
    if not os.path.exists(input_file):
        # Fallback to jpg if png missing
        input_file = r"d:\AI\ride-share-app\public\logo.jpg"
    
    if os.path.exists(input_file):
        crop_and_zoom_logo(input_file, output_file)
    else:
        print(f"File not found: {input_file}")
