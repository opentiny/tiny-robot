import { defineComponent, h, type PropType, type VNodeChild } from "vue";
import { toMdAst } from "../services/markdown/parse.js";
import type { Source } from "../services/chat/view.js";
import Citation from "./Citation.vue";
import RichBlock from "./RichBlock.vue";
export const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : undefined);
export default defineComponent({
  props: {
    text: { type: String, required: true },
    sources: Array as PropType<Source[]>,
    disableLink: Boolean,
  },
  setup(props) {
    return () => {
      const ast = toMdAst(props.text, { sources: props.sources, disableLink: props.disableLink });
      function render(n: any): VNodeChild {
        const children = () => n.children?.map(render);
        switch (n.type) {
          case "root":
            return h("div", { class: "markdown" }, children());
          case "text":
            return n.value
              .split(/\r?\n/)
              .flatMap((line: string, index: number) => (index ? [h("br"), line] : [line]));
          case "paragraph":
            return h("p", { class: "md-paragraph" }, children());
          case "heading":
            return h(`h${n.depth}`, children());
          case "strong":
            return h("strong", children());
          case "emphasis":
            return h("em", children());
          case "break":
            return h("br");
          case "thematicBreak":
            return h("hr");
          case "inlineCode":
            return h("code", n.value);
          case "code":
            return h(RichBlock, { value: n.value, lang: n.lang });
          case "math":
          case "inlineMath":
            return h(RichBlock, { value: n.value, math: true, inline: n.type === "inlineMath" });
          case "blockquote":
            return h("blockquote", children());
          case "list":
            return h(n.ordered ? "ol" : "ul", { start: n.start }, children());
          case "listItem":
            return h(
              "li",
              { class: typeof n.checked === "boolean" ? "task-list-item" : undefined },
              [
                ...(typeof n.checked === "boolean"
                  ? [h("span", { class: "task-checkbox" }, n.checked ? "☑  " : "□  ")]
                  : []),
                ...children(),
              ],
            );
          case "link":
            return h(
              "a",
              {
                href: safeUrl(n.url),
                target: "_blank",
                rel: "noopener noreferrer",
                title: n.title,
              },
              children(),
            );
          case "image":
            return h(
              "a",
              { href: safeUrl(n.url), target: "_blank", rel: "noopener noreferrer" },
              n.alt || n.url,
            );
          case "citation":
            return h(Citation, { source: n.source });
          case "table":
            return h(
              "div",
              { class: "table-scroll" },
              h("table", [
                h(
                  "thead",
                  h(
                    "tr",
                    n.children[0].children.map((c: any, i: number) =>
                      h("th", { style: { textAlign: n.align?.[i] } }, c.children.map(render)),
                    ),
                  ),
                ),
                h(
                  "tbody",
                  n.children.slice(1).map((r: any) =>
                    h(
                      "tr",
                      r.children.map((c: any, i: number) =>
                        h("td", { style: { textAlign: n.align?.[i] } }, c.children.map(render)),
                      ),
                    ),
                  ),
                ),
              ]),
            );
          case "html":
            return /^<br\s*\/?>$/i.test(n.value)
              ? h("br")
              : h("span", { class: "markdown-html" }, n.value);
          default:
            return children() || n.value || "";
        }
      }
      return render(ast);
    };
  },
});
