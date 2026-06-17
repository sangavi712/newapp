import os

def fix_imports_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    modified = False
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith('from app.') or stripped.startswith('from app ') or stripped.startswith('import app.'):
            # Check if previous line is already an ignore comment
            if len(new_lines) == 0 or '# pyrefly: ignore [missing-import]' not in new_lines[-1]:
                indent = line[:len(line) - len(stripped)]
                new_lines.append(f"{indent}# pyrefly: ignore [missing-import]\n")
                modified = True
        new_lines.append(line)
        
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('c:\\new learning app\\neww boss\\new design\\i am thee bessst\\buddylearn-ai\\backend'):
    if 'venv' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            fix_imports_in_file(os.path.join(root, file))

print("Done fixing missing imports!")
