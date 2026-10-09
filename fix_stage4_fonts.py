import re

# Read Stage 4 style.css
with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/04-learning/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Function to replace calc(Xpx * var(--ui-scale)) where X < 20
def replace_calc(match):
    full = match.group(0)
    # Extract the number
    num_match = re.search(r'calc\((\d+)px \* var\(--ui-scale\)\)', full)
    if num_match:
        num = int(num_match.group(1))
        if num < 20:
            new_num = 20
            return f'calc({new_num}px * var(--ui-scale))'
    return full

# Replace all calc(Xpx * var(--ui-scale)) where X < 20
css = re.sub(r'calc\(\d+px \* var\(--ui-scale\)\)', replace_calc, css)

# Also fix fixed font-size: 12px (like .btn-skip)
css = re.sub(r'font-size:\s*12px(?!\s*\*)', 'font-size: 20px', css)

# Write back
with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/04-learning/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Stage 4 style.css updated")

# Now fix inline styles in index.html
with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/04-learning/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix inline font-size: calc(Xpx * var(--ui-scale)) where X < 20
def replace_inline_calc(match):
    full = match.group(0)
    num_match = re.search(r'calc\((\d+)px \* var\(--ui-scale\)\)', full)
    if num_match:
        num = int(num_match.group(1))
        if num < 20:
            return full.replace(f'calc({num}px * var(--ui-scale))', f'calc(20px * var(--ui-scale))')
    return full

html = re.sub(r'font-size:\s*calc\(\d+px \* var\(--ui-scale\)\)', replace_inline_calc, html)

# Fix fixed font-size: Xpx where X < 20 (but not 0)
html = re.sub(r'font-size:\s*(\d+)px', lambda m: f'font-size: 20px' if int(m.group(1)) < 20 and int(m.group(1)) > 0 else m.group(0), html)

# Fix font: 13px monospace
html = re.sub(r'font:\s*13px\s+monospace', 'font: 20px monospace', html)

# Fix font-size: calc(13px * var(--ui-scale)) in #mute-btn inline style
html = re.sub(r'font-size:\s*calc\(13px \* var\(--ui-scale\)\)', 'font-size: calc(20px * var(--ui-scale))', html)

with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/04-learning/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Stage 4 index.html inline styles updated")
print("Done")