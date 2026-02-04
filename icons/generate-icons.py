#!/usr/bin/env python3
"""Generate extension icons in multiple sizes"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, output_file):
        """Create a simple icon with emoji-like design"""
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw blue circle background
        margin = size // 8
        draw.ellipse([margin, margin, size-margin, size-margin], 
                     fill='#3498db', outline='#2980b9', width=max(1, size//32))
        
        # Draw emoji-style face
        center = size // 2
        eye_y = center - size // 6
        eye_size = max(2, size // 16)
        
        # Left eye
        draw.ellipse([center - size//4 - eye_size, eye_y - eye_size,
                      center - size//4 + eye_size, eye_y + eye_size],
                     fill='white')
        
        # Right eye  
        draw.ellipse([center + size//4 - eye_size, eye_y - eye_size,
                      center + size//4 + eye_size, eye_y + eye_size],
                     fill='white')
        
        # Smile
        mouth_width = size // 3
        mouth_y = center + size // 6
        draw.arc([center - mouth_width, mouth_y - mouth_width//2,
                  center + mouth_width, mouth_y + mouth_width],
                 start=0, end=180, fill='white', width=max(2, size//24))
        
        # Save
        img.save(output_file, 'PNG')
        print(f"✅ Created {output_file} ({size}x{size})")
    
    # Generate all sizes
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    create_icon(16, os.path.join(script_dir, 'icon-16.png'))
    create_icon(48, os.path.join(script_dir, 'icon-48.png'))
    create_icon(128, os.path.join(script_dir, 'icon-128.png'))
    
    print("\n🎉 All icons generated successfully!")
    print("Icons are in the icons/ directory")
    
except ImportError:
    print("❌ PIL/Pillow not installed.")
    print("Install with: pip install Pillow")
    print("Or create icons manually and place them in icons/ directory:")
    print("  - icon-16.png (16x16)")
    print("  - icon-48.png (48x48)")
    print("  - icon-128.png (128x128)")
