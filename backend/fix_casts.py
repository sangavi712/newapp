import os
import glob

files = glob.glob('app/api/*.py')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # replace User.query.get(current_user_id) with User.query.get(int(current_user_id))
    if 'User.query.get(current_user_id)' in content:
        content = content.replace('User.query.get(current_user_id)', 'User.query.get(int(current_user_id))')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")

print("Done fixing integer casts.")
