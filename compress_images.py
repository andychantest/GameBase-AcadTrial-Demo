from PIL import Image
import os

def compress_png(path, max_colors=256, quality=85):
    """Compress PNG using palette reduction and optimization"""
    try:
        img = Image.open(path)
        # Convert to palette mode with limited colors for better compression
        if img.mode == 'RGBA':
            # Handle transparency
            palette_img = img.convert('P', palette=Image.Palette.ADAPTIVE, colors=max_colors)
            # Save with optimization
            palette_img.save(path, 'PNG', optimize=True)
        else:
            # RGB mode
            palette_img = img.convert('P', palette=Image.Palette.ADAPTIVE, colors=max_colors)
            palette_img.save(path, 'PNG', optimize=True)
        return True
    except Exception as e:
        print(f"Error compressing {path}: {e}")
        return False

# Stage 3 images
stage3_dir = r'C:\Dropbox\Opencode\Academic Trial GProject\Demo Game\stages\03-meaning\images'
# Stage 4 images  
stage4_dir = r'C:\Dropbox\Opencode\Academic Trial GProject\Demo Game\stages\04-learning\images'

total_saved = 0
total_files = 0

for base_dir in [stage3_dir, stage4_dir]:
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.lower().endswith('.png'):
                path = os.path.join(root, f)
                old_size = os.path.getsize(path)
                if compress_png(path):
                    new_size = os.path.getsize(path)
                    saved = old_size - new_size
                    total_saved += saved
                    total_files += 1
                    print(f"{f}: {old_size:,} -> {new_size:,} (saved {saved:,} bytes, {100*saved/old_size:.1f}%)")
                else:
                    print(f"{f}: FAILED")

print(f"\nTotal: {total_files} files, saved {total_saved:,} bytes ({total_saved/1024/1024:.2f} MB)")