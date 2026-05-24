import fs from 'fs';

const content = fs.readFileSync('d:\\YBF-main\\src\\pages\\Search.jsx', 'utf8');

function checkBalance(text) {
  // Remove self-closing tags
  const cleaned = text.replace(/<[a-zA-Z0-9]+\s+[^>]*\/>/g, '');
  
  const tags = cleaned.match(/<div|<\/div>|<article|<\/article>|<section|<\/section>|<main|<\/main>|<Link|<\/Link>/g);
  if (!tags) return;

  const stack = [];
  tags.forEach((tag, index) => {
    if (tag.startsWith('</')) {
      const closing = tag.replace(/<\/|>/g, '');
      if (stack.length > 0) {
        const openingObj = stack.pop();
        const opening = openingObj.tag.replace(/<|>/g, '').split(' ')[0];
        if (opening !== closing) {
          console.log(`Mismatch at index ${index}: Found </${closing}> but expected </${opening}> (opened at ${openingObj.tag})`);
        }
      } else {
        console.log(`Stray closing tag at index ${index}: ${tag}`);
      }
    } else {
      stack.push({ tag, index });
    }
  });

  if (stack.length > 0) {
    console.log(`Unclosed tags: ${stack.map(s => s.tag).join(', ')}`);
  } else {
    console.log('Tags are balanced!');
  }
}

checkBalance(content);
