import sys, re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

replacements = [
    # PURPLE -> CYAN
    (r'#7C3AED', '#06B6D4'),
    (r'124,\s*58,\s*237', '6, 182, 212'),

    # BLUE -> PINK
    (r'#2563EB', '#ec4899'),
    (r'37,\s*99,\s*235', '236, 72, 153'),
]

base_path = r'c:\Users\DELL\OneDrive\Desktop\majors\ReactForge\ReactForge'
update_file(base_path + r'\src\App.jsx', replacements)
update_file(base_path + r'\src\pages\Home.jsx', replacements)
update_file(base_path + r'\src\pages\Sandbox.jsx', replacements)
update_file(base_path + r'\src\pages\Sandbox.css', replacements)

print("done")
