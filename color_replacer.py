import sys, re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base_replacements = [
    # Backgrounds
    (r'#07070f', '#030712'),
    (r'#0d0d1a', '#111827'),
    (r'#161626', '#1f2937'),
    (r'rgba\(7,7,15,', 'rgba(3,7,18,'),

    # Accents (Cyan -> Purple, Magenta -> Pink, Blue -> Cyan)
    (r'#00ffe5', '#8b5cf6'),
    (r'0,255,229', '139,92,246'),
    (r'#00aaff', '#06b6d4'),
    (r'#f000ff', '#ec4899'),
    (r'240,0,255', '236,72,153'),
    (r'rgba\(0,255,200', 'rgba(139,92,246'),
    (r'#00ffc8', '#a855f7'),
]

home_replacements = base_replacements + [
    # HOOKS colors
    (r'"#8b5cf6"(\s*,\s*desc:\s*"Local state management)', r'"#06b6d4"\1'), 
    (r'"#ec4899"(\s*,\s*desc:\s*"Side effects)', r'"#8b5cf6"\1'), 
    (r'"#06b6d4"(\s*,\s*desc:\s*"Shared values)', r'"#3b82f6"\1'), 
    (r'"#ffee00"(\s*,\s*desc:\s*"Mutable references)', r'"#f59e0b"\1'), 
    (r'"#ff3d00"(\s*,\s*desc:\s*"Memoized expensive)', r'"#f43f5e"\1'), 
    (r'"#7dff00"(\s*,\s*desc:\s*"Stable callback)', r'"#10b981"\1'), 
    (r'"#ec4899"(\s*,\s*desc:\s*"Complex state)', r'"#ec4899"\1'), 
    (r'"#8b5cf6"(\s*,\s*desc:\s*"Reusable logic)', r'"#0ea5e9"\1'), 
    # Colors array
    (r'\["#8b5cf6", "#ec4899", "#06b6d4", "#ffee00", "#ff3d00", "#7dff00"\]', 
     '["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#f43f5e", "#10b981"]'),
]

sandbox_jsx_replacements = [
    # Sandbox Theme Colors
    (r'surface1:\s*"#06080f"', 'surface1: "#030712"'),
    (r'surface2:\s*"#0d121d"', 'surface2: "#111827"'),
    (r'surface3:\s*"#141b29"', 'surface3: "#1f2937"'),
    (r'clickable:\s*"#95a8c9"', 'clickable: "#9ca3af"'),
    (r'base:\s*"#dce7fb"', 'base: "#f3f4f6"'),
    (r'disabled:\s*"#3b4b69"', 'disabled: "#4b5563"'),
    (r'hover:\s*"#8fd6ff"', 'hover: "#8b5cf6"'),
    (r'accent:\s*"#8fd6ff"', 'accent: "#8b5cf6"'),
    (r'error:\s*"#ff5d7d"', 'error: "#ef4444"'),
    (r'errorSurface:\s*"#2a0f18"', 'errorSurface: "#450a0a"'),
    # Sandbox Syntax Colors
    (r'plain:\s*"#dce7fb"', 'plain: "#f3f4f6"'),
    (r'color:\s*"#6c7f9e"', 'color: "#6b7280"'),
    (r'keyword:\s*"#8fd6ff"', 'keyword: "#ec4899"'),
    (r'tag:\s*"#7cf4bd"', 'tag: "#3b82f6"'),
    (r'punctuation:\s*"#9fb2cf"', 'punctuation: "#9ca3af"'),
    (r'definition:\s*"#c4a8ff"', 'definition: "#8b5cf6"'),
    (r'property:\s*"#f6d58c"', 'property: "#10b981"'),
    (r'static:\s*"#f6d58c"', 'static: "#10b981"'),
    (r'string:\s*"#7cf4bd"', 'string: "#f59e0b"'),
]

sandbox_css_replacements = [
    (r'#04060b', '#030712'),
    (r'120, 171, 255', '139, 92, 246'),
    (r'rgba\(7, 10, 16,', 'rgba(3, 7, 18,'),
    (r'140, 177, 233', '139, 92, 246'),
    (r'133, 166, 221', '139, 92, 246'),
    (r'#b8cceb', '#cbd5e1'),
    (r'#8fd6ff', '#8b5cf6'),
    (r'#8ab4ff', '#ec4899'),
    (r'#07121f', '#fff'),
    (r'#e9f2ff', '#f8fafc'),
    (r'#8da4c6', '#94a3b8'),
    (r'#dce8fb', '#e2e8f0'),
    (r'143, 214, 255', '139, 92, 246'),
    (r'#7cf4bd', '#ec4899'),
    (r'124, 244, 189', '236, 72, 153'),
    (r'136, 168, 220', '139, 92, 246'),
    (r'#6c7f9e', '#64748b'),
    (r'rgba\(11, 16, 27,', 'rgba(17, 24, 39,'),
    (r'#a8bedf', '#cbd5e1'),
    (r'#0d2218', '#312e81'),
    (r'#3d9b6a', '#4338ca'),
    (r'#143d2a', '#3730a3'),
    (r'#060a12', '#030712'),
    (r'#080d18', '#1f2937'),
    (r'#c0d4f2', '#cbd5e1'),
    (r'#070c16', '#111827'),
    (r'#0a1019', '#1f2937'),
    (r'#0a101d', '#111827'),
    (r'#060b14', '#030712'),
    (r'#4a6589', '#374151'),
    (r'#0c1424', '#1f2937'),
    (r'#96afd4', '#94a3b8'),
]

base_path = r'c:\Users\DELL\OneDrive\Desktop\majors\ReactForge\ReactForge'
update_file(base_path + r'\src\App.jsx', base_replacements)
update_file(base_path + r'\src\pages\Home.jsx', home_replacements)
update_file(base_path + r'\src\pages\Sandbox.jsx', sandbox_jsx_replacements)
update_file(base_path + r'\src\pages\Sandbox.css', sandbox_css_replacements)
print("done")
