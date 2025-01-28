// noinspection JSUnresolvedReference

import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks:true,

});

export default function (source) {
    const content = md.render(source);
    const filePath = this.resourcePath;
    this.addDependency(filePath);
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
