import { resolveAssetUrl } from "./format";

export interface RichTextNode {
  name?: string;
  type?: "text";
  text?: string;
  attrs?: Record<string, string>;
  children?: RichTextNode[];
}

type ProseNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  content?: ProseNode[];
};

const spacing = "margin:0 0 15px 0;";
const textStyle =
  "font-size:16px;line-height:1.86;color:#2d3743;font-family:PingFang SC,HarmonyOS Sans SC,MiSans,Noto Sans SC,Microsoft YaHei,sans-serif;";

function el(
  name: string,
  style: string,
  children: RichTextNode[] = [],
  attrs: Record<string, string> = {},
): RichTextNode {
  return {
    name,
    attrs: { ...attrs, style },
    children,
  };
}

function text(value = ""): RichTextNode {
  return { type: "text", text: value };
}

function inlineChildren(node: ProseNode) {
  return (node.content ?? []).flatMap(convertNode);
}

function applyMarks(base: RichTextNode, marks: ProseNode["marks"] = []) {
  return marks.reduceRight<RichTextNode>((current, mark) => {
    const markType = mark.type;
    const attrs = mark.attrs ?? {};

    if (markType === "bold") {
      return el("strong", "font-weight:700;", [current]);
    }
    if (markType === "italic") {
      return el("em", "font-style:italic;", [current]);
    }
    if (markType === "strike") {
      return el("span", "text-decoration:line-through;", [current]);
    }
    if (markType === "underline") {
      return el("span", "text-decoration:underline;", [current]);
    }
    if (markType === "code") {
      return el(
        "code",
        "font-family:Menlo,Consolas,monospace;font-size:14px;color:#1379af;background:#e0f1fe;border-radius:4px;padding:2px 5px;",
        [current],
      );
    }
    if (markType === "link") {
      const href = typeof attrs.href === "string" ? attrs.href : "";
      return el(
        "a",
        "color:#46a8eb;text-decoration:none;font-weight:600;",
        [current],
        href ? { href } : {},
      );
    }
    if (markType === "textStyle" && typeof attrs.color === "string") {
      return el("span", `color:${attrs.color};`, [current]);
    }
    if (markType === "highlight") {
      const color = typeof attrs.color === "string" ? attrs.color : "#fff2a8";
      return el(
        "span",
        `background:${color};border-radius:4px;padding:0 3px;`,
        [current],
      );
    }

    return current;
  }, base);
}

function listItem(node: ProseNode) {
  const children = inlineChildren(node);
  return el(
    "li",
    "margin:0 0 8px 0;padding-left:2px;color:#263244;font-size:16px;line-height:1.76;",
    children,
  );
}

function tableCell(node: ProseNode, header = false) {
  return el(
    header ? "th" : "td",
    `border:1px solid #d7e2e8;padding:8px 10px;${header ? "background:#edf6f5;font-weight:700;" : ""}`,
    inlineChildren(node),
  );
}

export function convertNode(node: ProseNode): RichTextNode[] {
  switch (node.type) {
    case "doc":
      return inlineChildren(node);
    case "text":
      return [applyMarks(text(node.text ?? ""), node.marks)];
    case "hardBreak":
      return [el("br", "")];
    case "paragraph": {
      const children = inlineChildren(node);
      return [
        el(
          "p",
          `${spacing}${textStyle}`,
          children.length ? children : [el("br", "")],
        ),
      ];
    }
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const size = level === 1 ? 26 : level === 2 ? 22 : 19;
      const marginTop = level === 1 ? 22 : 18;
      return [
        el(
          `h${Math.min(Math.max(level, 1), 4)}`,
          `margin:${marginTop}px 0 12px 0;font-size:${size}px;line-height:1.35;font-weight:760;color:#15273a;`,
          inlineChildren(node),
        ),
      ];
    }
    case "blockquote":
      return [
        el(
          "blockquote",
          "margin:14px 0;padding:13px 15px;border-left:4px solid #46a8eb;background:#f3f6f8;border-radius:10px;color:#40566d;",
          inlineChildren(node),
        ),
      ];
    case "bulletList":
      return [
        el(
          "ul",
          "margin:0 0 16px 20px;padding:0;list-style:disc;",
          inlineChildren(node),
        ),
      ];
    case "orderedList":
      return [
        el(
          "ol",
          "margin:0 0 16px 20px;padding:0;list-style:decimal;",
          inlineChildren(node),
        ),
      ];
    case "listItem":
      return [listItem(node)];
    case "codeBlock":
      return [
        el(
          "pre",
          "margin:16px 0;padding:14px;overflow:auto;background:#17283a;color:#eaf6ff;border-radius:10px;font-size:13px;line-height:1.7;font-family:Menlo,Consolas,monospace;",
          [text((node.content ?? []).map((item) => item.text ?? "").join(""))],
        ),
      ];
    case "image": {
      const src =
        typeof node.attrs?.src === "string"
          ? resolveAssetUrl(node.attrs.src)
          : "";
      if (!src) return [];
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return [
        el("p", "margin:18px 0;", [
          {
            name: "img",
            attrs: {
              src,
              alt,
              style:
                "width:100%;max-width:100%;border-radius:14px;display:block;",
            },
          },
        ]),
      ];
    }
    case "horizontalRule":
      return [
        {
          name: "hr",
          attrs: {
            style: "margin:22px 0;border:0;border-top:1px solid #d9e7f2;",
          },
        },
      ];
    case "table":
      return [
        el(
          "table",
          "width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;color:#263244;",
          inlineChildren(node),
        ),
      ];
    case "tableRow":
      return [el("tr", "", inlineChildren(node))];
    case "tableHeader":
      return [tableCell(node, true)];
    case "tableCell":
      return [tableCell(node)];
    default:
      return inlineChildren(node);
  }
}

export function toRichTextNodes(content: unknown) {
  if (!content || typeof content !== "object") {
    return [el("p", `${spacing}${textStyle}`, [text("暂无正文内容")])];
  }
  const nodes = convertNode(content as ProseNode);
  return nodes.length
    ? nodes
    : [el("p", `${spacing}${textStyle}`, [text("暂无正文内容")])];
}
