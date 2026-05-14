"use client";
import { useState } from "react";

interface Props {
  code: string;
  lang?: string;
  title?: string;
}

export default function CodeBlock({ code, lang = "", title }: Props) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950 my-3">
      {(title || lang) && (
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-800 bg-zinc-900/70">
          <span className="text-xs font-mono text-zinc-400">{title || lang}</span>
          <button
            type="button"
            onClick={copy}
            className="text-xs text-zinc-400 hover:text-zinc-100"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre className="px-4 py-3 text-[13px] leading-6 font-mono text-zinc-100 overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
      {!title && !lang && (
        <button
          type="button"
          onClick={copy}
          className="absolute top-2 right-2 text-xs text-zinc-400 hover:text-zinc-100"
        >
          {copied ? "✓" : "Copy"}
        </button>
      )}
    </div>
  );
}
