import os
import shutil

os.makedirs('images', exist_ok=True)
os.makedirs('docs', exist_ok=True)

img_exts = {'.png', '.jpg', '.jpeg', '.gif', '.svg'}
doc_exts = {'.pdf', '.docx', '.doc', '.txt'}

# Move files
images_moved = []
docs_moved = []
for f in os.listdir('.'):
    if os.path.isfile(f):
        ext = os.path.splitext(f)[1].lower()
        if ext in img_exts:
            shutil.move(f, os.path.join('images', f))
            images_moved.append(f)
        elif ext in doc_exts and f not in ['requirements.txt']:
            shutil.move(f, os.path.join('docs', f))
            docs_moved.append(f)

def update_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Exact filename replacements
    for img in images_moved:
        content = content.replace(f'"{img}"', f'"images/{img}"')
        content = content.replace(f"'{img}'", f"'images/{img}'")
        content = content.replace(f'url({img})', f'url(images/{img})')
        content = content.replace(f'url("{img}")', f'url("images/{img}")')
        content = content.replace(f"url('{img}')", f"url('images/{img}')")

    for doc in docs_moved:
        doc_encoded = doc.replace(' ', '%20')
        content = content.replace(f'"{doc}"', f'"docs/{doc}"')
        content = content.replace(f"'{doc}'", f"'docs/{doc}'")
        content = content.replace(f'"{doc_encoded}"', f'"docs/{doc_encoded}"')
        content = content.replace(f"'{doc_encoded}'", f"'docs/{doc_encoded}'")
        
    # Manual template literal replacements for mlb.js
    content = content.replace("url('pitch${frameIdx}.png')", "url('images/pitch${frameIdx}.png')")
    content = content.replace("`bat${batFrameIdx}.png`", "`images/bat${batFrameIdx}.png`")
    content = content.replace("`bat1.png`", "`images/bat1.png`")
    content = content.replace("url('pitch5.png')", "url('images/pitch5.png')")
    content = content.replace("`bat5.png`", "`images/bat5.png`")
    
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

for f in ['index.html', 'mlb.html', 'style.css', 'mlb.css', 'script.js', 'mlb.js', 'convert_pdf.py']:
    update_file(f)

for f in ['v1/index.html', 'v1/script.js', 'v2/index.html', 'v2/script.js']:
    if os.path.exists(f):
        update_file(f)

print("Refactoring complete.")
