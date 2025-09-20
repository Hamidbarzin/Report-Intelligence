
// Very simple Markdown → HTML converter for executive summary display (without library)
export function miniMD(md = ""): string {
  let html = md
    .replace(/^### (.*)$/gmi, '<h3 class="text-lg font-bold mb-2">$1</h3>')
    .replace(/^## (.*)$/gmi,  '<h2 class="text-xl font-bold mb-2">$1</h2>')
    .replace(/^\- (.*)$/gmi,  '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  
  // Put lists inside <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-5 space-y-1">$1</ul>');
  return `<p>${html}</p>`;
}
