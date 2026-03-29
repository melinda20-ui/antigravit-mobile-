import os
import glob
import re

readme_files = glob.glob('README.*.md')
if 'README.md' not in readme_files:
    readme_files.append('README.md')

new_features = """| 🤖  | **Remote Autonomy**        | Auto-detect and 1-tap accept/reject CLI instructions remotely            |
| 📱  | **Telegram Alerts**        | Get push notifications for Blocks, Task completion and Pending actions   |
"""

for file in readme_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "Telegram Alerts" in content or "Remote Autonomy" in content:
        continue

    # Find the line that has Gemini, Claude, GPT in a table row
    lines = content.split('\n')
    new_lines = []
    updated = False
    for line in lines:
        new_lines.append(line)
        # More relaxed regex matching the row icon and keywords
        if '🤖' in line and 'Gemini' in line and 'Claude' in line and 'GPT' in line:
            new_lines.extend(new_features.strip().split('\n'))
            updated = True
            
    if updated:
        with open(file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"Updated {file}")
