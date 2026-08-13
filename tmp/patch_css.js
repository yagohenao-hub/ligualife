const fs = require('fs');
const filePath = 'c:/Users/Yago/Documents/LinguaLife 2.0/apps/web/styles/Classroom.module.css';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to find .slideNavArrow block
  const regex = /\.slideNavArrow\s*\{[\s\S]*?padding:.*?;[\s\S]*?font-size:.*?;[\s\S]*?transition:.*?;[\s\S]*?\}/;
  
  const newStyles = `.slideNavGroup {
  display: flex;
  gap: 0.4rem;
}

.slideNavArrow {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.15s;
}`;

  if (regex.test(content)) {
    content = content.replace(regex, newStyles);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated Classroom.module.css');
  } else {
    console.error('Could not find .slideNavArrow block in CSS');
  }
} catch (err) {
  console.error('Error updating CSS:', err);
  process.exit(1);
}
