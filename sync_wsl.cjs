const fs = require('fs');
const glob = require('glob');

const source = fs.readFileSync('README.md', 'utf-8');
const wslSectionMatch = source.match(/### Windows & WSL Integration[\s\S]*?full instructions\./);
if (!wslSectionMatch) {
    console.log("Could not find WSL section in README.md");
    process.exit(1);
}
const wslSection = '\n\n' + wslSectionMatch[0];

const files = fs.readdirSync('.').filter(f => f.startsWith('README.') && f.endsWith('.md') && f !== 'README.md');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Avoid double insertion
    if (content.includes('Windows & WSL Integration')) {
        console.log(`Skipped ${file} (already updated)`);
        continue;
    }

    // Insert after Launch Modes table
    // The table ends with `| SSL setup    | npm run setup:ssl...`
    // We'll just look for `| SSL setup` and the next empty line.
    
    const lines = content.split('\n');
    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('| SSL setup') || lines[i].includes('| SSL Setup')) {
            insertIndex = i + 1;
            break;
        }
    }
    
    if (insertIndex !== -1) {
        lines.splice(insertIndex, 0, wslSection);
        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Updated ${file}`);
    } else {
        console.log(`Warning: Could not find Launch Modes table in ${file}`);
    }
}
