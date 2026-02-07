
import os
from PIL import Image

# Configuration
SOURCE_PATH = r'c:\Users\hemal\Documents\Deal Finder\app\assets\logo-source.png'
ASSETS_DIR = r'c:\Users\hemal\Documents\Deal Finder\app\assets'

def generate_icons():
    if not os.path.exists(SOURCE_PATH):
        print(f"Error: Source file not found at {SOURCE_PATH}")
        return

    try:
        img = Image.open(SOURCE_PATH).convert("RGBA")
        print(f"Loaded source image: {img.size}")

        # 1. Main Icon (1024x1024)
        # Expo recommends 1024x1024. If source is different, resize.
        icon = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        icon.save(os.path.join(ASSETS_DIR, 'icon.png'))
        print("✅ Generated icon.png (1024x1024)")

        # 2. Adaptive Icon Foreground (1024x1024, but content in center 66%)
        # scaling factor for safety. 
        # If the user's logo is full bleed, we might want to shrink it for adaptive.
        # Let's make the logo 720x720 and center it on 1024x1024 canvas.
        adaptive_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        
        # Resize logo to fit nicely in the safe zone (approx 60-70%)
        # 1024 * 0.65 = ~665
        logo_size = 665
        logo_resized = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Center metadata
        bg_w, bg_h = adaptive_canvas.size
        img_w, img_h = logo_resized.size
        offset = ((bg_w - img_w) // 2, (bg_h - img_h) // 2)
        
        adaptive_canvas.paste(logo_resized, offset, logo_resized)
        adaptive_canvas.save(os.path.join(ASSETS_DIR, 'adaptive-icon.png'))
        print("✅ Generated adaptive-icon.png (Centered)")

        # 3. Splash Icon (Same as icon usually, or centered)
        # We can reuse the adaptive canvas or the full icon. 
        # Usually splash icon is just the logo centered. reusing icon.png is safer for simple setups.
        # But let's verify splash-icon.png usage. Often it's transparent bg.
        adaptive_canvas.save(os.path.join(ASSETS_DIR, 'splash-icon.png'))
        print("✅ Generated splash-icon.png")

    except Exception as e:
        print(f"Failed to generate icons: {e}")

if __name__ == "__main__":
    generate_icons()
