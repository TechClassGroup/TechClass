import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

export default function (source) {
    const content = md.render(source);

    return `
    import { h } from 'vue'
    const content = ${JSON.stringify(content)}
    
    export default {
      name: 'MarkdownContent',
      setup() {
        return () => h('div', {
          class: 'markdown-body',
          innerHTML: content
        })
      }
    }
  `;
}
