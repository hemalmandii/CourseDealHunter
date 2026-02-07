
import os
from PIL import Image

def convert_to_webp(directory, filenames):
    success_count = 0
    for filename in filenames:
        name, ext = os.path.splitext(filename)
        input_path = os.path.join(directory, filename)
        output_path = os.path.join(directory, f"{name}.webp")
        
        if not os.path.exists(input_path):
            print(f"Skipping {filename}: File not found")
            continue
            
        try:
            print(f"Converting {filename} to WebP...")
            with Image.open(input_path) as img:
                img.save(output_path, "WEBP", quality=85)
            print(f"Saved {output_path}")
            success_count += 1
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

    return success_count

if __name__ == "__main__":
    # Define paths based on known structure
    assets_dir = r"c:\Users\hemal\Documents\Deal Finder\app\src\assets" 
    # Note: user mentioned app/assets/ in chat but file explorer usually shows src/assets in RN projects or root assets.
    # Previous list_dir showed c:\Users\hemal\Documents\Deal Finder\app\assets for the images.
    # Let's verify the path. Step 92 showed "c:\Users\hemal\Documents\Deal Finder\app\assets".
    # But wait, step 92 call was `list_dir c:\Users\hemal\Documents\Deal Finder\app\assets` and it showed the files.
    # So the path is indeed `c:\Users\hemal\Documents\Deal Finder\app\assets`.
    
    target_dir = r"c:\Users\hemal\Documents\Deal Finder\app\assets"
    
    targets = ["w1.jpg", "w2.jpg", "w3.jpg"]
    
    # Check if we need to install Pillow (unlikely to work inside this script execution if missing, but good practice)
    try:
        import PIL
    except ImportError:
        print("Pillow is not installed. Please run: pip install Pillow")
        exit(1)
        
    converted = convert_to_webp(target_dir, targets)
    print(f"Conversion complete. converted {converted}/{len(targets)} files.")
