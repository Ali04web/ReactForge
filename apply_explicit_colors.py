import sys, re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Apply App.jsx Rules
app_replacements = [
    # root variables
    (r'--bg: #[0-9a-fA-F]+;', '--bg: #0B0B0F;'),
    (r'--panel: #[0-9a-fA-F]+;', '--panel: #111827;'),
    (r'--panel-2: #[0-9a-fA-F]+;', '--panel-2: #1f2937;'),
    (r'color: #fff;', 'color: #E5E7EB;'),
    (r'--text-soft: rgba\(255,255,255,0.6\);', '--text-soft: #9CA3AF;'),
    (r'--text-dim: rgba\(255,255,255,0.4\);', '--text-dim: #9ca3af;'),
    
    # CTA Gradient -> Solid Color
    (r'background: linear-gradient\(135deg, var\(--accent\), var\(--accent-2\)\);', 'background: #F97316;'),
    
    # background: rgba(12, 10, 9,0.85); for site-nav
    (r'background: rgba\(12, 10, 9,0\.85\);', 'background: rgba(11, 11, 15, 0.85);'),
    
    # Grid and Scanlines color fixes (from sunset to primary gradient start)
    (r'rgba\(249, 115, 22,0\.06\)', 'rgba(124, 58, 237, 0.06)'), # 124, 58, 237 is #7C3AED
    
    # Update hover glow references
    (r'#f97316', '#7C3AED'),
]

# Apply Home.jsx Rules
home_replacements = [
    # Gradients and hexes
    (r'"#8b5cf6"', '"#7C3AED"'),
    (r'"#ec4899"', '"#2563EB"'),    # Middle of gradient
    (r'rgba\(139,92,246,', 'rgba(124,58,237,'), # Background radial
    (r'rgba\(236,72,153,', 'rgba(6,182,212,'),  # Background radial 2
    
    # The main gradient hero
    (r'linear-gradient\(90deg,#8b5cf6,#06b6d4\)', 'linear-gradient(90deg, #7C3AED, #2563EB, #06B6D4)'),
    (r'#8b5cf688', '#7C3AED88'),
    
    # colors array in challengecard
    (r'\["#8b5cf6", "#ec4899", "#00d4ff", "#ffee00", "#ff3d00", "#7dff00"\]', '["#7C3AED", "#2563EB", "#06B6D4", "#61DAFB", "#F97316", "#E5E7EB"]'),
    
    # Active tab text colors
    (r'#030712', '#0B0B0F'),
]

sandbox_jsx_replacements = [
    (r'surface1: "#0c0a09"', 'surface1: "#0B0B0F"'),
    (r'surface2: "#1c1917"', 'surface2: "#111827"'),
    (r'surface3: "#292524"', 'surface3: "#1F2937"'),
    (r'background: #090b10', 'background: #0B0B0F'),
    (r'background: #121623', 'background: #111827'),
    (r'background: #111726', 'background: #111827'),
    (r'background: #0d121e', 'background: #0B0B0F'),
    (r'background: #0d121f', 'background: #111827'),
]

sandbox_css_replacements = [
    (r'background: #0c0a09;', 'background: #0B0B0F;'),
    (r'background: rgba\(12, 10, 9, 0\.96\);', 'background: rgba(11, 11, 15, 0.96);'),
    (r'background: rgba\(12, 10, 9, 0\.98\);', 'background: rgba(11, 11, 15, 0.98);'),
    (r'background: rgba\(28, 25, 23, 0\.95\);', 'background: rgba(17, 24, 39, 0.95);'), # #111827
    (r'background: #1c1917 \!important;', 'background: #111827 !important;'),
    (r'background: #292524 \!important;', 'background: #1F2937 !important;'),
    (r'background: #292524;', 'background: #1F2937;'),
    
    # rgba border replacements
    (r'rgba\(249, 115, 22, 0\.16\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.14\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.18\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.28\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.35\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.2\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.4\)', '#1F2937'),
    (r'rgba\(249, 115, 22, 0\.22\)', '#1F2937'),
    
    (r'color: #f8fafc;', 'color: #E5E7EB;'),
    (r'color: #94a3b8;', 'color: #9CA3AF;'),
]

base_path = r'c:\Users\DELL\OneDrive\Desktop\majors\ReactForge\ReactForge'
update_file(base_path + r'\src\App.jsx', app_replacements)
update_file(base_path + r'\src\pages\Home.jsx', home_replacements)
update_file(base_path + r'\src\pages\Sandbox.jsx', sandbox_jsx_replacements)
update_file(base_path + r'\src\pages\Sandbox.css', sandbox_css_replacements)

print("done")
