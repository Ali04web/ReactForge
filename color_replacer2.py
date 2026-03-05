import sys, re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

replacements = [
    # Backgrounds
    (r'#030712', '#0c0a09'),
    (r'#111827', '#1c1917'),
    (r'#1f2937', '#292524'),
    (r'rgba\(3,\s*7,\s*18,', 'rgba(12, 10, 9,'),
    (r'rgba\(17,\s*24,\s*39,', 'rgba(28, 25, 23,'), # equivalent to stone-900 for challenge hint bar

    # Accents (Purple -> Orange, Pink -> Yellow, Cyan -> Red)
    (r'#8b5cf6', '#f97316'), 
    (r'139,\s*92,\s*246', '249, 115, 22'),
    (r'#ec4899', '#eab308'),
    (r'236,\s*72,\s*153', '234, 179, 8'),
    (r'#06b6d4', '#ef4444'),

    # Sandbox overrides
    (r'#9ca3af', '#a8a29e'),
    (r'#f3f4f6', '#f5f5f4'),
    (r'#4b5563', '#57534e'),
    (r'#6b7280', '#78716c'),
    (r'#3b82f6', '#ef4444'), # Tag color in sandbox
]

base_path = r'c:\Users\DELL\OneDrive\Desktop\majors\ReactForge\ReactForge'
update_file(base_path + r'\src\App.jsx', replacements)
update_file(base_path + r'\src\pages\Home.jsx', replacements)
update_file(base_path + r'\src\pages\Sandbox.jsx', replacements)
update_file(base_path + r'\src\pages\Sandbox.css', replacements)

print("done")
