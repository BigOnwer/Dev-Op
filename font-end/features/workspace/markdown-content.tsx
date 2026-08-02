import type { ReactNode } from "react";

function inline(content: string): ReactNode[] {
  return content.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g).filter(Boolean).map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong className="font-semibold text-zinc-100" key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[.85em] text-violet-200" key={index}>{part.slice(1, -1)}</code>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em className="text-zinc-200" key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const codeStart = line.match(/^```([^\s]*)/);
    if (codeStart) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) { code.push(lines[index]); index += 1; }
      if (index < lines.length) index += 1;
      blocks.push(<div className="my-4 overflow-hidden rounded-xl border border-zinc-700 bg-[#0b0b0d]" key={`code-${index}`}><div className="border-b border-zinc-800 px-3 py-2 font-mono text-xs text-zinc-500">{codeStart[1] || "código"}</div><pre className="scrollbar-subtle overflow-x-auto p-4 font-mono text-xs leading-6 text-violet-100"><code>{code.join("\n")}</code></pre></div>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)/);
    if (heading) {
      const level = heading[1].length;
      const classes = level === 1 ? "mt-5 text-lg font-semibold text-zinc-50" : level === 2 ? "mt-4 text-base font-semibold text-zinc-100" : "mt-3 text-sm font-semibold text-zinc-200";
      blocks.push(<p className={classes} key={`heading-${index}`}>{inline(heading[2])}</p>);
      index += 1;
      continue;
    }

    const isBullet = /^\s*[-*+]\s+/.test(line);
    const isNumbered = /^\s*\d+\.\s+/.test(line);
    if (isBullet || isNumbered) {
      const items: string[] = [];
      const matcher = isNumbered ? /^\s*\d+\.\s+(.+)/ : /^\s*[-*+]\s+(.+)/;
      while (index < lines.length) {
        const item = lines[index].match(matcher);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      const List = isNumbered ? "ol" : "ul";
      blocks.push(<List className={`my-3 space-y-1.5 pl-5 ${isNumbered ? "list-decimal" : "list-disc"}`} key={`list-${index}`}>{items.map((item, itemIndex) => <li className="pl-1" key={itemIndex}>{inline(item)}</li>)}</List>);
      continue;
    }

    const quote = line.match(/^>\s?(.+)/);
    if (quote) {
      blocks.push(<blockquote className="my-3 border-l-2 border-violet-400/70 pl-3 text-zinc-300" key={`quote-${index}`}>{inline(quote[1])}</blockquote>);
      index += 1;
      continue;
    }

    if (!line.trim()) { index += 1; continue; }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !lines[index].startsWith("```") && !/^(#{1,3})\s+/.test(lines[index]) && !/^\s*[-*+]\s+/.test(lines[index]) && !/^\s*\d+\.\s+/.test(lines[index]) && !/^>\s?/.test(lines[index])) { paragraph.push(lines[index]); index += 1; }
    blocks.push(<p className="my-2" key={`paragraph-${index}`}>{inline(paragraph.join(" "))}</p>);
  }

  return <div className="markdown-content">{blocks}</div>;
}
