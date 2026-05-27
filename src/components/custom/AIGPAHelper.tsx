"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, ArrowRight, MessageSquare, AlertTriangle, Clipboard, RotateCcw, Check, AlertCircle, ChevronDown, ChevronUp, BrainCircuit, Camera, Paperclip, FileText, Square, Award } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Render a LaTeX string to HTML using KaTeX (safe fallback on error)
function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return latex;
  }
}

// Helper to escape HTML and format non-math text segment with bold, italics, code tags
function formatNonMathHtml(str: string): string {
  let escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold & Italic: ***text***
  escaped = escaped.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  escaped = escaped.replace(/\*\*_(.*?)_\*\*/g, "<strong><em>$1</em></strong>");
  escaped = escaped.replace(/_\*\*(.*?)\*\*_/g, "<strong><em>$1</em></strong>");

  // Bold: **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Underscore Italic: _text_
  escaped = escaped.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline code: `code`
  escaped = escaped.replace(/`(.*?)`/g, "<code class='bg-gray-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md font-mono text-[10.5px] text-pink-600 dark:text-blue-400 font-bold border border-gray-200/50 dark:border-zinc-700/50'>$1</code>");


  // Links: [text](url)
  escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-pink-500 hover:text-pink-600 dark:hover:text-blue-400 font-bold underline transition-colors'>$1</a>");

  return escaped;
}

// Split text into segments of plain text and inline math ($...$)
function renderInlineMath(str: string): React.ReactNode[] {
  // Delimiter splits: standard $...$ (no space after start, no space before end) and \( ... \)
  const parts = str.split(/(\$[^\s$](?:[^$]*?[^\s$])?\$|\\\([\s\S]+?\\\))/g);
  return parts.map((part, idx) => {
    if ((part.startsWith("$") && part.endsWith("$") && part.length > 2) ||
        (part.startsWith("\\(") && part.endsWith("\\)"))) {
      const latex = part.startsWith("$") ? part.slice(1, -1) : part.slice(2, -2);
      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: renderMath(latex, false) }}
          className="inline-math mx-0.5"
        />
      );
    }
    const formattedHtml = formatNonMathHtml(part);
    return (
      <span
        key={idx}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    );
  });
}

// Interactive Code Block Renderer
function CodeBlockRenderer({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-gray-250 dark:border-zinc-800/80 shadow-md bg-zinc-900 text-zinc-100 font-mono text-[11px]">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/80 border-b border-zinc-800 text-[9px] font-black uppercase tracking-wider text-zinc-400 select-none">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></>
          ) : (
            <><Clipboard className="w-3 h-3" /><span>Copy</span></>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed select-text text-blue-100/90 no-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}


interface FlatListItem {
  indent: number;
  content: React.ReactNode;
  key: string | number;
}

interface StackFrame {
  indent: number;
  items: { key: string | number; content: React.ReactNode; sublist?: React.ReactNode }[];
}

function buildNestedList(items: FlatListItem[], isOrdered: boolean): React.ReactNode[] {
  if (items.length === 0) return [];
  
  const minIndent = Math.min(...items.map(item => item.indent));
  const stack: StackFrame[] = [{ indent: minIndent - 1, items: [] }];
  
  for (const item of items) {
    while (stack.length > 1 && stack[stack.length - 1].indent > item.indent) {
      const popped = stack.pop()!;
      if (popped.items.length > 0) {
        const ListTag = isOrdered ? "ol" : "ul";
        const listClass = isOrdered 
          ? "list-decimal pl-5 my-1 space-y-1 text-gray-750 dark:text-zinc-350"
          : "list-disc pl-5 my-1 space-y-1 text-gray-750 dark:text-zinc-350";
        const sublistNode = (
          <ListTag className={listClass}>
            {popped.items.map(subItem => (
              <li key={subItem.key} className="leading-relaxed">
                {subItem.content}
                {subItem.sublist}
              </li>
            ))}
          </ListTag>
        );
        
        const parentFrame = stack[stack.length - 1];
        if (parentFrame.items.length > 0) {
          parentFrame.items[parentFrame.items.length - 1].sublist = sublistNode;
        } else {
          parentFrame.items.push({
            key: `sublist-fallback-${item.key}`,
            content: sublistNode
          });
        }
      }
    }
    
    if (item.indent > stack[stack.length - 1].indent) {
      stack.push({
        indent: item.indent,
        items: [{ key: item.key, content: item.content }]
      });
    } else {
      stack[stack.length - 1].items.push({ key: item.key, content: item.content });
    }
  }
  
  while (stack.length > 1) {
    const popped = stack.pop()!;
    if (popped.items.length > 0) {
      const ListTag = isOrdered ? "ol" : "ul";
      const listClass = isOrdered 
        ? "list-decimal pl-5 my-1 space-y-1 text-gray-750 dark:text-zinc-350"
        : "list-disc pl-5 my-1 space-y-1 text-gray-750 dark:text-zinc-350";
      const sublistNode = (
        <ListTag className={listClass}>
          {popped.items.map(subItem => (
            <li key={subItem.key} className="leading-relaxed">
              {subItem.content}
              {subItem.sublist}
            </li>
          ))}
        </ListTag>
      );
      
      const parentFrame = stack[stack.length - 1];
      if (parentFrame.items.length > 0) {
        parentFrame.items[parentFrame.items.length - 1].sublist = sublistNode;
      } else {
        parentFrame.items.push({
          key: `sublist-fallback-end`,
          content: sublistNode
        });
      }
    }
  }
  
  const ListTag = isOrdered ? "ol" : "ul";
  const listClass = isOrdered 
    ? "list-decimal pl-5 my-2 space-y-1.5 text-gray-700 dark:text-zinc-300"
    : "list-disc pl-5 my-2 space-y-1.5 text-gray-700 dark:text-zinc-300";
    
  return [
    <ListTag key="outer-list" className={listClass}>
      {stack[0].items.map(rootItem => (
        <li key={rootItem.key} className="leading-relaxed">
          {rootItem.content}
          {rootItem.sublist}
        </li>
      ))}
    </ListTag>
  ];
}

// Custom Lightweight Markdown Parser for structured, secure rendering of AI responses
function MarkdownRenderer({ text }: { text: string }) {
  const formatText = (str: string) => {
    const hasMath = /(\$[^\s$](?:[^$]*?[^\s$])?\$|\\\([\s\S]+?\\\))/.test(str);
    if (hasMath) return <>{renderInlineMath(str)}</>;
    return <span dangerouslySetInnerHTML={{ __html: formatNonMathHtml(str) }} />;
  };

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  
  let currentBulletList: FlatListItem[] = [];
  let currentOrderedList: FlatListItem[] = [];
  let currentBlockquote: React.ReactNode[] = [];
  let currentTableRows: React.ReactNode[][] = [];
  
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLanguage = "";

  let inMathBlock = false;
  let mathBlockLines: string[] = [];
  let mathBlockDelimiter = "";

  const flushBulletList = (key: string | number) => {
    if (currentBulletList.length > 0) {
      elements.push(
        <React.Fragment key={`ul-${key}`}>
          {buildNestedList(currentBulletList, false)}
        </React.Fragment>
      );
      currentBulletList = [];
    }
  };

  const flushOrderedList = (key: string | number) => {
    if (currentOrderedList.length > 0) {
      elements.push(
        <React.Fragment key={`ol-${key}`}>
          {buildNestedList(currentOrderedList, true)}
        </React.Fragment>
      );
      currentOrderedList = [];
    }
  };

  const flushBlockquote = (key: string | number) => {
    if (currentBlockquote.length > 0) {
      elements.push(
        <blockquote key={`quote-${key}`} className="border-l-4 border-pink-500/50 pl-4 py-1.5 my-2.5 bg-pink-500/5 dark:bg-pink-950/20 border border-transparent dark:border-pink-500/5 rounded-r-2xl italic text-gray-600 dark:text-zinc-400 space-y-1 leading-relaxed">
          {currentBlockquote}
        </blockquote>
      );
      currentBlockquote = [];
    }
  };

  const flushTable = (key: string | number) => {
    if (currentTableRows.length > 0) {
      elements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto my-3 rounded-2xl border border-gray-250 dark:border-zinc-800/80 shadow-inner">
          <table className="min-w-full text-[10px] text-left border-collapse bg-white/20 dark:bg-zinc-950/20">
            <thead>
              <tr className="bg-gray-100/50 dark:bg-zinc-900/50 border-b border-gray-205 dark:border-zinc-800/80">
                {currentTableRows[0]?.map((cell, idx) => (
                  <th key={`th-${idx}`} className="px-3 py-2.5 font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTableRows.slice(1).map((row, rowIdx) => (
                <tr key={`tr-${rowIdx}`} className="border-b border-gray-200/30 dark:border-zinc-800/40 last:border-0 hover:bg-white/5">
                  {row.map((cell, cellIdx) => (
                    <td key={`td-${cellIdx}`} className="px-3 py-2 text-gray-700 dark:text-zinc-300 font-medium">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
    }
  };

  const flushAll = (key: string | number) => {
    flushBulletList(key);
    flushOrderedList(key);
    flushBlockquote(key);
    flushTable(key);
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Find the number of leading spaces/tabs before the first non-whitespace char to preserve nesting depth
    const indentMatch = rawLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;

    // 0. Check if we are currently accumulating a multi-line math block
    if (inMathBlock) {
      let isEnd = false;
      if (mathBlockDelimiter === "$$" && line.includes("$$")) {
        isEnd = true;
        const index = rawLine.indexOf("$$");
        if (index > 0) {
          mathBlockLines.push(rawLine.substring(0, index));
        }
      } else if (mathBlockDelimiter === "\\[" && line.includes("\\]")) {
        isEnd = true;
        const index = rawLine.indexOf("\\]");
        if (index > 0) {
          mathBlockLines.push(rawLine.substring(0, index));
        }
      } else if (mathBlockDelimiter.startsWith("\\begin") && line.includes(`\\end{${mathBlockDelimiter.substring(7)}`)) {
        isEnd = true;
        mathBlockLines.push(rawLine);
      }

      if (isEnd) {
        inMathBlock = false;
        const latex = mathBlockLines.join("\n");
        elements.push(
          <div
            key={`math-block-${i}`}
            className="my-3 overflow-x-auto text-center bg-black/5 dark:bg-black/20 p-3 rounded-2xl border border-gray-250 dark:border-zinc-800/80 select-text animate-[fadeIn_0.3s_ease]"
            dangerouslySetInnerHTML={{ __html: renderMath(latex, true) }}
          />
        );
        mathBlockLines = [];
        mathBlockDelimiter = "";
      } else {
        mathBlockLines.push(rawLine);
      }
      continue;
    }

    // Check for Code Block delimiter
    if (line.startsWith("```")) {
      flushAll(i);
      if (inCodeBlock) {
        // End code block
        inCodeBlock = false;
        elements.push(
          <CodeBlockRenderer
            key={`code-${i}`}
            code={codeBlockLines.join("\n")}
            language={codeBlockLanguage}
          />
        );
        codeBlockLines = [];
        codeBlockLanguage = "";
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Start of display math block
    if (line === "$$" || line === "\\[") {
      flushAll(i);
      inMathBlock = true;
      mathBlockDelimiter = line;
      continue;
    }

    const beginMatch = line.match(/^\\begin\{([a-zA-Z*]+)\}/);
    if (beginMatch) {
      flushAll(i);
      inMathBlock = true;
      mathBlockDelimiter = `\\begin{${beginMatch[1]}}`;
      mathBlockLines.push(rawLine);
      continue;
    }

    // Single-line block math
    if (
      (line.startsWith("$$") && line.endsWith("$$") && line.length > 4) ||
      (line.startsWith("\\[") && line.endsWith("\\]") && line.length > 4)
    ) {
      flushAll(i);
      const latex = line.startsWith("$$") ? line.slice(2, -2) : line.slice(2, -2);
      elements.push(
        <div
          key={`math-block-single-${i}`}
          className="my-3 overflow-x-auto text-center bg-black/5 dark:bg-black/20 p-3 rounded-2xl border border-gray-250 dark:border-zinc-800/80 select-text animate-[fadeIn_0.3s_ease]"
          dangerouslySetInnerHTML={{ __html: renderMath(latex, true) }}
        />
      );
      continue;
    }

    // 2. Check for Table Row: starts and ends with |
    if (line.startsWith("|") && line.endsWith("|")) {
      flushBulletList(i);
      flushOrderedList(i);
      flushBlockquote(i);
      
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

      // If it is a separator line (e.g. |---|---|), skip it
      const isSeparator = cells.every((c) => /^:-{1,}:?$/.test(c) || /^-+$/.test(c));
      if (isSeparator) {
        continue;
      }

      const parsedCells = cells.map((c) => formatText(c));
      currentTableRows.push(parsedCells);
      continue;
    } else {
      flushTable(i);
    }

    // 3. Check for Blockquote: starts with >
    if (line.startsWith(">")) {
      flushBulletList(i);
      flushOrderedList(i);
      flushTable(i);

      let content = line.substring(1);
      if (content.startsWith(" ")) {
        content = content.substring(1);
      }
      currentBlockquote.push(
        <p key={`quote-p-${i}`} className="my-1">
          {formatText(content)}
        </p>
      );
      continue;
    } else {
      flushBlockquote(i);
    }

    // 4. Check for Bullet List Item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushOrderedList(i);
      const content = line.substring(2).trim();
      currentBulletList.push({
        indent,
        content: formatText(content),
        key: `li-bullet-${i}`
      });
      continue;
    } else {
      flushBulletList(i);
    }

    // 5. Check for Ordered List Item: starts with digit(s) followed by a dot and a space
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      flushBulletList(i);
      const content = orderedMatch[2].trim();
      currentOrderedList.push({
        indent,
        content: formatText(content),
        key: `li-ordered-${i}`
      });
      continue;
    } else {
      flushOrderedList(i);
    }

    // 6. Check for Horizontal Rule: ---, ***, ___
    if (line === "---" || line === "***" || line === "___") {
      flushAll(i);
      elements.push(<hr key={`hr-${i}`} className="my-4 border-gray-250 dark:border-zinc-800/80" />);
      continue;
    }

    // 7. Regular text paragraph / Headers
    if (line === "") {
      elements.push(<div key={`br-${i}`} className="h-1.5" />);
    } else if (line.startsWith("###### ")) {
      elements.push(
        <h6 key={`h6-${i}`} className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mt-2 mb-1">
          {formatText(line.substring(7))}
        </h6>
      );
    } else if (line.startsWith("##### ")) {
      elements.push(
        <h5 key={`h5-${i}`} className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mt-2.5 mb-1">
          {formatText(line.substring(6))}
        </h5>
      );
    } else if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-[11px] font-extrabold text-pink-500/90 mt-3 mb-1">
          {formatText(line.substring(5))}
        </h4>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xs font-extrabold text-pink-500 mt-3 mb-1">
          {formatText(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm font-extrabold text-gray-800 dark:text-zinc-100 mt-3.5 mb-1.5">
          {formatText(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-base font-extrabold text-gray-950 dark:text-white mt-4 mb-2 border-b border-gray-200/50 dark:border-zinc-800/80 pb-1">
          {formatText(line.substring(2))}
        </h1>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} className="my-1.5 leading-relaxed text-gray-700 dark:text-zinc-300">
          {formatText(line)}
        </p>
      );
    }
  }

  // Flush remaining lists, tables or blockquotes
  flushAll("end");

  return <div className="space-y-0.5">{elements}</div>;
}

// Custom DeepSeek R1 Think/Reasoning parser
function R1ThinkContainer({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="my-2 border border-pink-500/30 dark:border-pink-500/10 rounded-2xl bg-gradient-to-r from-blue-500/5 to-pink-500/5 dark:from-pink-950/20 dark:to-yellow-950/5 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-pink-500/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-blue-400 hover:bg-pink-500/5 transition-colors cursor-pointer select-none"
      >
        <span className="flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          DeepSeek R1 Thinking Process
        </span>
        <span className="text-[9px] font-extrabold">{isOpen ? "Hide Details ▲" : "Show Details ▼"}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-pink-500/10 bg-black/5 dark:bg-black/20"
          >
            <div className="px-4 py-3 text-[11px] font-medium leading-relaxed text-gray-600 dark:text-zinc-400 italic font-mono whitespace-pre-wrap select-text selection:bg-pink-500/20">
              {text.trim()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Special parser to handle think blocks and main response splits
function parseThinkTags(content: string): { thinkText: string; mainText: string } {
  const thinkStart = content.indexOf("<think>");
  if (thinkStart !== -1) {
    const thinkEnd = content.indexOf("</think>");
    if (thinkEnd !== -1) {
      const thinkText = content.substring(thinkStart + 7, thinkEnd);
      const mainText = content.substring(thinkEnd + 8);
      return { thinkText, mainText };
    } else {
      // Stream hasn't completed closing think tags yet
      const thinkText = content.substring(thinkStart + 7);
      return { thinkText, mainText: "" };
    }
  }
  return { thinkText: "", mainText: content };
}

// Rendering message component that manages the custom DeepSeek layout
function MessageContentRenderer({ text }: { text: string }) {
  const { thinkText, mainText } = parseThinkTags(text);
  return (
    <div className="space-y-1">
      {thinkText && <R1ThinkContainer text={thinkText} />}
      {mainText && <MarkdownRenderer text={mainText} />}
    </div>
  );
}

// Typing visual streaming effect component
function StreamingMarkdownRenderer({
  text,
  active,
  onComplete,
  onWordTyped,
}: {
  text: string;
  active: boolean;
  onComplete?: () => void;
  onWordTyped?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) {
      setDisplayedText(text);
      return;
    }

    const words = text.split(" ");
    let currentIndex = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        const chunk = words.slice(currentIndex, currentIndex + 2).join(" ");
        setDisplayedText((prev) => {
          const next = prev ? prev + " " + chunk : chunk;
          setTimeout(() => onWordTyped?.(), 0);
          return next;
        });
        currentIndex += 2;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text, active, onComplete, onWordTyped]);

  return <MessageContentRenderer text={displayedText} />;
}

export class IndexedDBStore {
  private dbName = "EZVTOP_AI_DB";
  private storeName = "ai_chat_store";

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB not supported in this environment"));
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB set failed, using localStorage fallback:", e);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.error("Storage fallback failed:", err);
      }
    }
  }

  async get(key: string): Promise<any> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB get failed, using localStorage fallback:", e);
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        return null;
      }
    }
  }

  async clearStore(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      try {
        localStorage.removeItem("messages");
        localStorage.removeItem("studentProfile");
      } catch (err) {
        console.error(err);
      }
    }
  }
}
export const dbStore = new IndexedDBStore();

interface AIGPAHelperProps {
  marksData: any;
  allGradesData: any;
  attendanceData: any;
  hostelData?: any;
  scheduleData?: any;
  moodleData?: any;
}

export default function AIGPAHelper({
  marksData,
  allGradesData,
  attendanceData,
  hostelData,
  scheduleData,
  moodleData,
}: AIGPAHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [personalized, setPersonalized] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: "user" | "model"; text: string; reasoning?: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [animatedIndices, setAnimatedIndices] = useState<Set<number>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [customAlert, setCustomAlert] = useState<string | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
  


  // Tab State
  const [activeTab, setActiveTab] = useState<"chat" | "quiz">("chat");

  // Quiz Mode State
  const [quizCourse, setQuizCourse] = useState<string>("");
  const [quizQuestion, setQuizQuestion] = useState<string>("");
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string>("");
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [userSelectedOption, setUserSelectedOption] = useState<string>("");
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load message history and student profile from IndexedDB on mount
  useEffect(() => {
    const loadHistoryAndProfile = async () => {
      const savedMessages = await dbStore.get("messages");
      if (savedMessages && Array.isArray(savedMessages)) {
        setMessages(savedMessages);
      }
      const savedProfile = await dbStore.get("studentProfile");
      if (savedProfile) {
        setDbProfile(savedProfile);
      }
    };
    loadHistoryAndProfile();
  }, []);

  // Save message history to IndexedDB whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      dbStore.set("messages", messages);
    }
  }, [messages]);

  // Save complete student profile to IndexedDB whenever student data updates
  useEffect(() => {
    const saveProfile = async () => {
      const hasMarks = marksData && Object.keys(marksData).length > 0 && marksData.courses && marksData.courses.length > 0;
      const hasAttendance = attendanceData && Object.keys(attendanceData).length > 0 && attendanceData.attendance && attendanceData.attendance.length > 0;
      
      if (!hasMarks && !hasAttendance) {
        return; // Avoid overwriting with empty/incomplete data on initial render
      }

      const profile = {
        marksData,
        allGradesData,
        attendanceData,
        hostelData,
        scheduleData,
        moodleData,
        cachedAt: new Date().toISOString()
      };
      setDbProfile(profile);
      await dbStore.set("studentProfile", profile);
    };
    saveProfile();
  }, [marksData, allGradesData, attendanceData, hostelData, scheduleData, moodleData]);

  useEffect(() => {
    const dismissed = localStorage.getItem("ezvtop-ai-tooltip-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  // Compress an image file to a JPEG data-URL at max 1024px and 0.85 quality
  const compressImage = (file: File): Promise<{ base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = url;
    });

  // ---------------------------------------------------------------------------
  // PDF Upload handler — uses PDF.js for free text extraction.
  // Selectable-text PDFs: extracted instantly (zero API cost).
  // Scanned/image PDFs: each page rendered to canvas → Groq vision OCR.
  // ---------------------------------------------------------------------------
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrStatus("Loading PDF...");

    try {
      // Dynamically import pdfjs-dist (avoids SSR issues)
      const pdfjsLib = await import("pdfjs-dist");
      // Use bundled worker via CDN to avoid webpack worker issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const allText: string[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setOcrStatus(`Extracting page ${pageNum}/${totalPages}...`);
        const page = await pdf.getPage(pageNum);

        // Try native text extraction first (free, instant)
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ")
          .trim();

        if (pageText.length > 10) {
          // Page has selectable text — use it directly
          allText.push(pageText);
        } else {
          // Scanned page — render to canvas → Groq vision OCR
          setOcrStatus(`OCR scanning page ${pageNum}/${totalPages}...`);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          // Compress canvas to JPEG for Groq
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          const base64 = dataUrl.split(",")[1];

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/llama-4-scout-17b-16e-instruct",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
                    {
                      type: "text",
                      text: `Extract ALL text from this PDF page. For math expressions use LaTeX ($...$ inline, $$...$$ display). Preserve structure. Output raw text only — no commentary.`,
                    },
                  ],
                },
              ],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const visionText = (data.choices?.[0]?.message?.content || "").trim();
            if (visionText) allText.push(visionText);
          }
        }
      }

      const combined = allText.join("\n\n").trim();
      if (combined) {
        setInput((prev) => (prev ? prev + "\n\n" + combined : combined));
        setCustomAlert(`✅ PDF extracted (${totalPages} page${totalPages > 1 ? "s" : ""})! Content pasted into input.`);
      } else {
        setCustomAlert("PDF processed but no readable text was found.");
      }
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      setCustomAlert("⚠️ Error reading PDF. Make sure it's a valid PDF file.");
    } finally {
      setOcrLoading(false);
      setOcrStatus("");
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrStatus("Reading image...");

    try {
      // Compress image client-side to avoid large payload issues
      setOcrStatus("Compressing image...");
      const { base64, mimeType } = await compressImage(file);

      setOcrStatus("Analyzing with AI vision...");

      // Call Groq vision API directly from client (works on static deployments)
      const payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              {
                type: "text",
                text: `You are a precise academic OCR engine with expert-level LaTeX math transcription.

Your task:
1. Extract ALL text visible in this image exactly as written — preserve structure, numbering, bullets, and indentation.
2. For every mathematical expression (equations, fractions, integrals, summations, Greek letters, sub/superscripts, matrices) — transcribe using LaTeX: inline math as $...$, display/block equations as $$...$$.
3. Preserve logical reading order. Do not add commentary or explanations.
4. Output raw text only — no introductory phrases like "Here is the text:" or "The image shows:".`,
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: payload.messages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Groq vision OCR error:", response.status, errText);
        throw new Error(`Vision model error (${response.status})`);
      }

      const data = await response.json();
      const extractedText = (data.choices?.[0]?.message?.content || "").trim();

      if (extractedText) {
        setInput((prev) => (prev ? prev + "\n" + extractedText : extractedText));
        setCustomAlert("✅ AI Vision OCR complete! Text & math pasted into input.");
      } else {
        setCustomAlert("OCR finished but no readable content was detected.");
      }
    } catch (err: any) {
      console.error("OCR vision error:", err);
      setCustomAlert("⚠️ Error reading image. Please try again.");
    } finally {
      setOcrLoading(false);
      setOcrStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const scrollToBottom = (smooth = true) => {
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [isOpen, messages]);



  const getDynamicStudentContext = (userQuery?: string, allowedTypes?: string[]) => {
    try {
      const activeMarks = dbProfile?.marksData || marksData;
      const activeAllGrades = dbProfile?.allGradesData || allGradesData;
      const activeAttendance = dbProfile?.attendanceData || attendanceData;
      const activeHostel = dbProfile?.hostelData || hostelData;
      const activeSchedule = dbProfile?.scheduleData || scheduleData;
      const activeMoodle = dbProfile?.moodleData || moodleData;

      // 1. Core Profile summary (very lightweight)
      const core = {
        cgpa: activeMarks?.cgpa?.cgpa || null,
        creditsEarned: activeMarks?.cgpa?.creditsEarned || null,
        isHosteller: activeHostel?.hostelInfo?.isHosteller || false,
        room: activeHostel?.hostelInfo?.roomNo || null,
        block: activeHostel?.hostelInfo?.block || null,
      };

      const contextObj: any = { core };
      const types = allowedTypes || ["marks", "attendance", "hostel", "schedule", "allGrades", "moodle"];

      // 2. Full Academics Data (courses, assessments, individual marks)
      if (types.includes("marks")) {
        contextObj.marks = {
          courses: activeMarks?.courses?.map((c: any) => {
            const totals = c.assessments?.reduce(
              (acc: any, asm: any) => {
                acc.max += Number(asm.maxMark) || 0;
                acc.scored += Number(asm.scoredMark) || 0;
                acc.weightPercent += Number(asm.weightagePercent) || 0;
                acc.weighted += Number(asm.weightageMark) || 0;
                return acc;
              },
              { max: 0, scored: 0, weightPercent: 0, weighted: 0 }
            ) || { max: 0, scored: 0, weightPercent: 0, weighted: 0 };
            
            const currentCoursePercentage = totals.weightPercent > 0 
              ? ((totals.weighted / totals.weightPercent) * 100).toFixed(2) 
              : "0.00";

            return {
              courseTitle: c.courseTitle,
              courseCode: c.courseCode,
              courseType: c.courseType,
              faculty: c.faculty,
              slot: c.slot,
              courseTotals: {
                totalScoredWeightedMarks: totals.weighted.toFixed(2),
                totalWeightagePercentCompleted: totals.weightPercent.toFixed(2),
                currentCoursePercentage: currentCoursePercentage
              },
              assessments: c.assessments?.map((a: any) => ({
                title: a.title,
                maxMark: a.maxMark,
                scoredMark: a.scoredMark,
                weightagePercent: a.weightagePercent,
                weightageMark: a.weightageMark
              }))
            };
          }) || []
        };
      }

      // 3. Full Semester Grades (aligned with grades object structure)
      if (types.includes("allGrades") && activeAllGrades?.grades) {
        const gradesBySemester: any = {};
        for (const [semester, coursesList] of Object.entries(activeAllGrades.grades)) {
          if (Array.isArray(coursesList)) {
            gradesBySemester[semester] = coursesList.map((g: any) => ({
              courseTitle: g.courseTitle,
              courseCode: g.courseCode,
              grade: g.grade,
              credits: g.credits
            }));
          }
        }
        contextObj.allGrades = gradesBySemester;
      }

      // 4. Full Attendance Data (including slot, time, venue, and faculty)
      if (types.includes("attendance")) {
        contextObj.attendance = activeAttendance?.attendance?.map((a: any) => ({
          courseTitle: a.courseTitle,
          courseCode: a.courseCode,
          slotName: a.slotName,
          slotVenue: a.slotVenue,
          time: a.time,
          faculty: a.faculty,
          attendancePercentage: a.attendancePercentage,
          attendedClasses: a.attendedClasses,
          totalClasses: a.totalClasses
        })) || [];
      }

      // 5. Hostel Leaves Data (aligned with leaveHistory structure)
      if (types.includes("hostel")) {
        const leaveHistoryMapped = activeHostel?.leaveHistory?.map((l: any) => ({
          leaveId: l.leaveId,
          leaveType: l.leaveType,
          from: l.from,
          to: l.to,
          reason: l.reason,
          visitPlace: l.visitPlace,
          status: l.status
        })) || [];
        contextObj.hostel = {
          block: activeHostel?.hostelInfo?.block || null,
          roomNo: activeHostel?.hostelInfo?.roomNo || null,
          leaveHistory: leaveHistoryMapped.slice(-10)
        };
      }

      // 6. Schedule/Timetable Data
      if (types.includes("schedule")) {
        contextObj.schedule = activeSchedule?.timetable?.map((s: any) => ({
          courseTitle: s.courseTitle,
          slotName: s.slotName,
          venue: s.slotVenue
        })) || [];
      }

      // 7. Moodle/LMS Assignment Data
      if (types.includes("moodle")) {
        contextObj.moodle = activeMoodle?.map((m: any) => ({
          name: m.name,
          due: m.due,
          done: m.done,
          teachers: m.teachers
        })) || [];
      }

      let jsonStr = JSON.stringify(contextObj);

      // Safety check: if payload size exceeds 12000 characters, truncate secondary details,
      // but NEVER touch marks, grades, or attendance.
      if (jsonStr.length > 12000) {
        if (contextObj.hostel?.leaveHistory) {
          contextObj.hostel.leaveHistory = contextObj.hostel.leaveHistory.slice(-2);
        }
        if (contextObj.schedule && contextObj.schedule.length > 8) {
          contextObj.schedule = contextObj.schedule.slice(0, 8);
        }
        if (contextObj.moodle && contextObj.moodle.length > 6) {
          contextObj.moodle = contextObj.moodle.slice(0, 6);
        }
        jsonStr = JSON.stringify(contextObj);
      }

      return jsonStr;
    } catch (e) {
      return "{}";
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;



    if (!textToSend) setInput("");
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Step 1: Use another AI call to dynamically select relevant datasets
      let selectedDataTypes: string[] = ["marks", "attendance", "hostel", "schedule", "allGrades", "moodle"];
      try {
        const classifierPrompt = `You are a student data router. Analyze the user's query and determine which data modules are needed to answer it.
Query: "${query}"

Selectable Modules:
- "marks": Detailed assessment scores, course codes, titles, and maximum marks.
- "allGrades": GPA, CGPA, and letter grades of previous semesters.
- "attendance": Class attendance percentages, hours, and status.
- "hostel": Hostel block, room number, leaves list, and status.
- "schedule": Timetable slots, class timings, and venues.
- "moodle": LMS deadlines, assignments, pending tasks, and status.

Return ONLY a strict JSON array containing the chosen module names. Example output: ["marks", "attendance"]. Do not output markdown code blocks or any explanation.`;

        const classifierResponse = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: classifierPrompt }],
          }),
          signal: controller.signal,
        });

        if (classifierResponse.ok) {
          const classifierData = await classifierResponse.json();
          const contentText = classifierData.choices?.[0]?.message?.content || "";
          
          const startIdx = contentText.indexOf("[");
          const endIdx = contentText.lastIndexOf("]");
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const candidateStr = contentText.substring(startIdx, endIdx + 1);
            try {
              const parsed = JSON.parse(candidateStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                selectedDataTypes = parsed;
              } else {
                // If router returned empty array [], default to academic records
                selectedDataTypes = ["marks", "attendance", "allGrades"];
              }
            } catch (jsonErr) {
              console.warn("Router JSON parse failed:", jsonErr);
            }
          }
        }
      } catch (err) {
        console.warn("AI routing call failed, falling back to all modules:", err);
      }

      // Step 2: Build student context with only the selected data modules
      const context = getDynamicStudentContext(query, selectedDataTypes);
      
      const systemInstruction = `You are EZVTOP AI, an elite Academic Mentor & Data Analyst for VIT Chennai Campus students.
Full Student Profile Datasets (JSON): ${context}

Capabilities:
1. Explain academic/engineering topics with maximum depth, clarity, and mathematical rigor.
2. Generate structured formula sheets (using mathematical formatting or code blocks) for subjects/topics.
3. Perform deep, thorough analyses across the student's dataset (courses, marks, internal grades, assessments, attendance logs, previous semester grades, exam slot/seat schedules, hostel info, leave logs, mess options, and Moodle/LMS upcoming tasks/assignments).

Rules:
1. Always provide highly structured, comprehensive, and in-depth responses (never give brief or superficial answers, even for simple questions). For any educational topic, deliver rich multi-section guides featuring clear numbered headers, bold highlights, comparison tables, step-by-step logic/examples, and bulleted takeaways. Make the student feel wowed by your thoroughness, formatting layout, and absolute clarity!
2. Use professional structural formatting: markdown tables, blockquotes, bullet points, headers, inline code pills, clickable markdown links (formatted as [text](url)), and KaTeX block/inline math formulas ($...$ or $$...$$) where applicable.
3. Incorporate rich visual learning tools in your responses:
   - **Textual Mindmaps/Hierarchies**: Use text-based tree structures or flowcharts (e.g., indented bullets with icons or lines) to map out hierarchies, concepts, or decision trees.
   - **Transition Arrows**: Use arrows (\`->\` or \`=>\`) extensively to show flows, transitions, sequences, process states, and derivations.
   - **DOs & DONTs Checklist**: Provide clear bullet lists or tables showing specific Dos and Don'ts for student study patterns, exam prep, or attendance management.
   - **Important Points (Key Takeaways)**: Highlight critical points using bold indicators, emojis, or blockquotes.
4. Be encouraging, mathematically precise, and proactive:
   - When asked about grades, calculate exact grade targets step-by-step.
   - Proactively highlight items that need attention (e.g., attendance approaching or below 75%, upcoming LMS deadlines, low assessment scores, or hostel leaves status).
   - Use emojis, clean headers, and structured tables to make the response extremely scannable and beautiful.
5. Response language: English.
6. At the very end of your response, always append exactly 3 relevant follow-up suggestions representing the next questions that naturally come to the student's mind in this format: [Suggestions: Question 1 | Question 2 | Question 3]
7. Under context.marks, each course contains a pre-calculated "courseTotals" object. Always reference "currentCoursePercentage" as the official current percentage score of the student for that course. Do not try to sum raw scored marks over max marks, as different assessments have different weightages.`;

      // Limit message history to the last 6 messages to keep context window clean and under token limits
      let recentMessages = messages.slice(-6);
      let payloadCharCount = systemInstruction.length + query.length + recentMessages.reduce((sum, m) => sum + m.text.length, 0);
      
      while (recentMessages.length > 0 && payloadCharCount > 8000) {
        recentMessages = recentMessages.slice(1);
        payloadCharCount = systemInstruction.length + query.length + recentMessages.reduce((sum, m) => sum + m.text.length, 0);
      }

      const messagesPayload = [
        { role: "system", content: systemInstruction },
        ...recentMessages.map((m) => ({
          role: m.role === "model" ? "assistant" : m.role,
          content: m.text,
        })),
        { role: "user", content: query },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesPayload,
        }),
        signal: controller.signal,
      });

      const data = await response.json();
      if (!data.choices && (data.error || data.message)) {
        console.error("EZVTOP AI backend error response:", data);
      }
      const choice = data.choices?.[0];
      const answer = choice?.message?.content || data.error?.message || data.message || "I was unable to analyze that. Please try again.";
      const reasoning = choice?.message?.reasoning || undefined;
      
      setMessages((prev) => [...prev, { role: "model", text: answer, reasoning }]);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: "⚠️ Response generation was stopped by the user.",
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "❌ Error connecting to EZVTOP AI. Please check your network connection.",
        },
      ]);
    } finally {
      setLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // Exam Quiz Mode generator handler
  const generateQuizQuestion = async (courseName: string) => {
    setQuizLoading(true);
    setQuizSubmitted(false);
    setUserSelectedOption("");
    setQuizFeedback("");
    
    try {
      const prompt = `Generate a single multiple-choice question to test a university student in the course: "${courseName}".
Include exactly 4 options. Format the output as a strict JSON object with no additional text or formatting backticks.
The JSON must follow this structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A (or whichever is correct)",
  "explanation": "Brief explanation of why it is correct"
}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      
      setQuizQuestion(parsed.question);
      setQuizOptions(parsed.options);
      setQuizAnswer(parsed.correctAnswer);
      setQuizFeedback(parsed.explanation);
    } catch (e) {
      console.error("Error generating quiz question:", e);
      setQuizQuestion("Failed to generate question. Please try again.");
      setQuizOptions([]);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSubmit = (selected: string) => {
    if (quizSubmitted) return;
    setUserSelectedOption(selected);
    setQuizSubmitted(true);
    
    const isCorrect = selected.trim().toLowerCase() === quizAnswer.trim().toLowerCase();
    
    setQuizScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const parseSuggestionsFromMessage = (text: string) => {
    const match = text.match(/\[Suggestions:\s*(.*?)\]/i);
    if (match) {
      const rawSuggestions = match[1];
      const parsed = rawSuggestions.split("|").map(s => s.trim()).filter(Boolean);
      const cleanedText = text.replace(/\[Suggestions:\s*(.*?)\]/i, "").trim();
      return { cleanedText, parsed };
    }
    return { cleanedText: text, parsed: [] };
  };

  const copyToClipboard = (text: string, index: number) => {
    const { mainText } = parseThinkTags(text);
    navigator.clipboard.writeText(mainText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const getDynamicSuggestions = () => {
    const list = ["Analyze my performance & suggest improvements"];
    
    // Dynamically retrieve courses from marksData
    const courseList = marksData?.courses || [];
    if (courseList.length > 0) {
      const course1 = courseList[0]?.courseTitle;
      list.push(`Teach me shortly about ${course1}`);
      if (courseList.length > 1) {
        const course2 = courseList[1]?.courseTitle;
        list.push(`Formula sheet for ${course2}`);
      } else {
        list.push(`Formula sheet for ${course1}`);
      }
    } else {
      list.push("Teach me a topic shortly...");
      list.push("Formula sheet for Physics...");
    }

    list.push("What FAT marks do I need for S/A grade?");
    
    if (hostelData?.hostelInfo?.isHosteller) {
      list.push("Show my hostel leaves & mess info");
    } else {
      list.push("Show my upcoming exams & venues");
    }
    
    return list;
  };

  return (
    <>
      {/* Tooltip / Coachmark pointing to the AI button */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-[164px] right-6 z-30 select-none max-w-[250px]"
          >
            <div className="relative bg-white/95 dark:bg-zinc-955/95 backdrop-blur-md border border-pink-500/30 text-gray-800 dark:text-zinc-100 font-bold text-[11px] p-4 rounded-3xl shadow-xl shadow-pink-500/5">
              <div className="flex flex-col gap-1 pr-4">
                <span className="text-[10px] font-black uppercase text-pink-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                  EZVTOP AI GPA Helper
                </span>
                <span className="text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  Get personalized grade target plans, attendance insights, and exam quiz prep!
                </span>
              </div>
              <button
                onClick={() => {
                  setShowTooltip(false);
                  localStorage.setItem("ezvtop-ai-tooltip-dismissed", "true");
                }}
                className="absolute top-3.5 right-3.5 p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Arrow pointing down to the FAB */}
              <div className="absolute bottom-[-5px] right-[26px] w-2.5 h-2.5 bg-white dark:bg-zinc-950 rotate-45 border-b border-r border-pink-500/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-30">
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center cursor-pointer border border-blue-300"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.button>
      </div>

      {/* Slide-over sheet panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            {/* Chat Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-slate-50/95 dark:bg-zinc-950/95 border-l border-white/20 dark:border-zinc-800/60 shadow-2xl flex flex-col z-50 backdrop-blur-xl"
            >
              <style>{`
                @keyframes aiWave {
                  0%, 100% { height: 4px; opacity: 0.4; }
                  50% { height: 18px; opacity: 1; }
                }
                @keyframes aiShimmer {
                  100% { transform: translateX(100%); }
                }
                /* Custom Scrollbar for Chat */
                .chat-scrollbar::-webkit-scrollbar {
                  width: 5px;
                }
                .chat-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .chat-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(245, 158, 11, 0.2);
                  border-radius: 99px;
                }
                .chat-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(245, 158, 11, 0.4);
                }
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {/* Header */}
              <div className="p-5 border-b border-gray-200 dark:border-zinc-900 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg shadow-pink-500/20 relative">
                    <Sparkles className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-gray-900 dark:text-white uppercase flex items-center gap-1.5">
                      EZVTOP AI
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-pink-600 dark:text-blue-400 font-black uppercase tracking-wider">
                        Active Agent
                      </span>
                      <span className="text-[9px] text-gray-300 dark:text-zinc-700 font-bold">•</span>
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">
                        Unlimited Quota
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Personalize Toggle */}
                  <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-gray-200/50 dark:border-zinc-800/80">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none">
                      Personalize
                    </span>
                    <button
                      onClick={() => setPersonalized(!personalized)}
                      className={`relative w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                        personalized ? "bg-pink-500" : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-3 h-3 rounded-full bg-white shadow-sm"
                        style={{ marginLeft: personalized ? "12px" : "0px" }}
                      />
                    </button>
                  </div>

                  {messages.length > 0 && (
                    <button
                      onClick={() => {
                        setCustomConfirm({
                          message: "Are you sure you want to reset the conversation? This will clear all chat history.",
                          onConfirm: () => {
                            setMessages([]);
                            setAnimatedIndices(new Set());
                            dbStore.set("messages", []);
                          },
                        });
                      }}
                      title="Reset Conversation"
                      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>


              {/* Tab Selector */}
              <div className="px-5 pt-3 flex gap-2 border-b border-gray-200/30 dark:border-zinc-900 bg-white/10 dark:bg-zinc-950/10 select-none">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === "chat"
                      ? "border-pink-500 text-pink-500"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Academic Chat
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === "quiz"
                      ? "border-pink-500 text-pink-500"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Exam Quiz Mode
                </button>
              </div>

              {activeTab === "chat" ? (
                <>
                  {/* Chat Viewport */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-scrollbar">
                    {messages.length === 0 && (
                      <div className="space-y-6 py-4">
                        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-3xl p-5 text-center space-y-3 shadow-sm">
                          <Sparkles className="w-10 h-10 mx-auto text-pink-500 animate-pulse" />
                          <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                            Ask EZVTOP AI Anything
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                            I analyze your attendance, internal marks, and target grade goals to offer specific, mathematical score plans using high-speed reasoning and LLM infrastructure.
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            Try these topics
                          </p>
                          {getDynamicSuggestions().map((s, index) => (
                            <button
                              key={index}
                              onClick={() => handleSend(s)}
                              className="w-full text-left p-4 bg-white dark:bg-zinc-900/90 hover:bg-pink-500/5 hover:border-pink-500/30 border border-gray-200 dark:border-zinc-800/80 rounded-2xl text-xs text-gray-800 dark:text-zinc-100 font-black tracking-tight transition-all flex items-center gap-3 justify-between group active:scale-[0.98] shadow-sm cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <Sparkles className="w-3.5 h-3.5 text-pink-500 flex-shrink-0 animate-pulse" />
                                <span className="group-hover:text-pink-500 transition-colors">{s}</span>
                              </div>
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-pink-500 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages mapping */}
                    <AnimatePresence>
                      {messages.map((m, index) => {
                        const isLatestModelMessage = m.role === "model" && !animatedIndices.has(index);
                        const isLatestMessage = index === messages.length - 1;
                        const { cleanedText, parsed } = parseSuggestionsFromMessage(m.text);
                        const suggestionsToUse = parsed.length > 0 ? parsed : getDynamicSuggestions();
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={`flex flex-col w-full ${
                              m.role === "user" ? "ml-auto items-end max-w-[85%]" : "mr-auto items-start max-w-full"
                            }`}
                          >
                            <div
                              className={`p-4 rounded-3xl text-xs leading-relaxed border shadow-sm relative group ${
                                m.role === "user"
                                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-blue-300/30 rounded-tr-none font-bold"
                                  : "bg-white/40 dark:bg-zinc-900/40 border-white/20 dark:border-zinc-800/60 text-gray-800 dark:text-zinc-200 rounded-tl-none w-full"
                              }`}
                            >
                              {m.role === "user" ? (
                                m.text
                              ) : (
                                <div className="space-y-1">
                                  {m.reasoning && <R1ThinkContainer text={m.reasoning} />}
                                  <StreamingMarkdownRenderer
                                    text={cleanedText}
                                    active={isLatestModelMessage}
                                    onComplete={() => {
                                      setAnimatedIndices((prev) => {
                                        const next = new Set(prev);
                                        next.add(index);
                                        return next;
                                      });
                                      setTimeout(() => scrollToBottom(true), 50);
                                    }}
                                    onWordTyped={() => scrollToBottom(false)}
                                  />
                                </div>
                              )}
                              
                              {m.role === "model" && (
                                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-200/30 dark:border-zinc-800/30">
                                  <button
                                    onClick={() => copyToClipboard(cleanedText, index)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-blue-400 transition-all text-gray-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wide cursor-pointer active:scale-95"
                                  >
                                    {copiedIndex === index ? (
                                      <><Check className="w-3 h-3 text-green-500" /><span className="text-green-500">Copied!</span></>
                                    ) : (
                                      <><Clipboard className="w-3 h-3" /><span>Copy</span></>
                                    )}
                                  </button>
                                </div>
                              )}

                              {m.role === "model" && isLatestMessage && !isLatestModelMessage && (
                                <div className="mt-3.5 flex flex-col gap-2 pt-3.5 border-t border-gray-200/50 dark:border-zinc-800/50">
                                  {suggestionsToUse.slice(0, 3).map((s, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleSend(s)}
                                      className="w-full text-left px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs text-gray-800 dark:text-zinc-200 font-black tracking-tight transition-all flex items-center gap-2.5 justify-between group active:scale-[0.98] shadow-sm cursor-pointer hover:border-pink-500/30 hover:bg-pink-500/5"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Sparkles className="w-3.5 h-3.5 text-pink-500 flex-shrink-0 animate-pulse" />
                                        <span className="group-hover:text-pink-500 transition-colors truncate">{s}</span>
                                      </div>
                                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-pink-500 flex-shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Loading state */}
                    {loading && (
                      <div className="flex mr-auto items-start max-w-[85%] animate-fadeIn">
                        <div className="p-4 rounded-3xl text-xs bg-white/40 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 text-gray-500 rounded-tl-none flex flex-col gap-2 shadow-sm w-full max-w-[280px] relative overflow-hidden group">
                          {/* Glow Sweep effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent -translate-x-full animate-[aiShimmer_2s_infinite] pointer-events-none" />
                          
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 rounded bg-pink-500/10 text-pink-500">
                              <Sparkles className="w-3.5 h-3.5 animate-[spin_4s_linear_infinite]" />
                            </div>
                            <span className="font-extrabold uppercase text-[9px] tracking-wider text-pink-600 dark:text-blue-400">EZVTOP AI thinking...</span>
                          </div>

                          <div className="flex items-end gap-1.5 h-6 pl-1 pt-1.5">
                            {/* Audio Wave Visualizer Bars */}
                            <div className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full animate-[aiWave_1s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                            <div className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full animate-[aiWave_1s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }} />
                            <div className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full animate-[aiWave_1s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
                            <div className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full animate-[aiWave_1s_ease-in-out_infinite]" style={{ animationDelay: "450ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input Container */}
                  <div className="p-4 border-t border-gray-200 dark:border-zinc-900 bg-white/25 dark:bg-zinc-950/25 backdrop-blur-md flex flex-col gap-2.5">
                    {ocrLoading && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-blue-400 animate-pulse text-[10px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>{ocrStatus}</span>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleOcrUpload}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                    />

                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      accept="application/pdf"
                      className="hidden"
                    />

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="flex gap-2"
                    >
                      <button
                        type="button"
                        disabled={ocrLoading || loading}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3.5 rounded-2xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-pink-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload image for AI OCR"
                      >
                        <Camera className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={ocrLoading || loading}
                        onClick={() => pdfInputRef.current?.click()}
                        className="p-3.5 rounded-2xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-pink-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload PDF — extracts text & math"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your GPA/scores..."
                        disabled={loading || ocrLoading}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-xs font-semibold placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {loading ? (
                        <button
                          type="button"
                          onClick={handleStopResponse}
                          className="p-3.5 rounded-2xl bg-rose-500 hover:bg-rose-650 text-white shadow-lg shadow-rose-500/10 transition-all active:scale-[0.96] flex items-center justify-center cursor-pointer"
                          title="Stop generating"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!input.trim() || ocrLoading}
                          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-pink-500 hover:brightness-105 text-white shadow-lg shadow-pink-500/10 transition-all active:scale-[0.96] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-scrollbar">
                  {quizQuestion === "" ? (
                    <div className="space-y-6 py-4">
                      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-3xl p-5 text-center space-y-4 shadow-sm">
                        <Award className="w-10 h-10 mx-auto text-pink-500 animate-pulse" />
                        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                          Prepare with EZVTOP Exam Quiz
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                          Test your understanding of your active courses. Select a course below to generate interactive multiple-choice questions graded instantly by the Instant model.
                        </p>
                        
                        <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                          <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-left pl-1">Select Course</label>
                          {marksData?.courses && marksData.courses.length > 0 ? (
                            <select
                              value={quizCourse}
                              onChange={(e) => setQuizCourse(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            >
                              <option value="">-- Choose a course --</option>
                              {marksData.courses.map((c: any, idx: number) => (
                                <option key={idx} value={c.courseTitle}>
                                  {c.courseTitle}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={quizCourse}
                              onChange={(e) => setQuizCourse(e.target.value)}
                              placeholder="Enter subject (e.g. Physics, DBMS)"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            />
                          )}
                          
                          <button
                            onClick={() => {
                              if (quizCourse) generateQuizQuestion(quizCourse);
                            }}
                            disabled={!quizCourse || quizLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {quizLoading ? "Generating Question..." : "Start Practice Quiz"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Score Tracker */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/40 shadow-sm">
                        <span className="text-[10px] font-black uppercase text-gray-400">Quiz Scoreboard</span>
                        <span className="text-xs font-black text-pink-500">
                          {quizScore.correct} / {quizScore.total} Correct
                        </span>
                      </div>

                      {/* Question Container */}
                      <div className="p-5 rounded-3xl bg-white/40 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 shadow-sm space-y-4">
                        <span className="text-[9px] font-black uppercase tracking-wider text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full">
                          {quizCourse}
                        </span>
                        <h4 className="text-xs font-bold leading-relaxed text-gray-800 dark:text-zinc-250 whitespace-pre-wrap select-text">
                          {quizQuestion}
                        </h4>

                        {quizLoading ? (
                          <div className="py-6 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
                            <span className="text-xs font-semibold text-gray-500">Generating next question...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 pt-2">
                            {quizOptions.map((opt, idx) => {
                              const isSelected = userSelectedOption === opt;
                              const isCorrectAnswer = opt.trim().toLowerCase() === quizAnswer.trim().toLowerCase();
                              let pillStyle = "border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:bg-pink-500/5 hover:border-pink-500/30";
                              
                              if (quizSubmitted) {
                                if (isCorrectAnswer) {
                                  pillStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                                } else if (isSelected) {
                                  pillStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                                } else {
                                  pillStyle = "opacity-50 border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900";
                                }
                              }
                              
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleQuizSubmit(opt)}
                                  disabled={quizSubmitted}
                                  className={`w-full text-left p-3.5 border rounded-2xl text-xs font-semibold transition-all flex items-center justify-between shadow-sm cursor-pointer ${pillStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && isCorrectAnswer && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                                  {quizSubmitted && isSelected && !isCorrectAnswer && <X className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Feedback & Explanation */}
                        {quizSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 mt-4 space-y-2"
                          >
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-blue-400">
                              <BrainCircuit className="w-4 h-4" />
                              Explanation & Feedback
                            </div>
                            <p className="text-xs leading-relaxed text-gray-700 dark:text-zinc-300">
                              {quizFeedback}
                            </p>
                          </motion.div>
                        )}
                        
                        {/* Control buttons */}
                        {quizSubmitted && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setQuizQuestion("");
                                setQuizCourse("");
                              }}
                              className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-800 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-gray-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Exit Quiz
                            </button>
                            <button
                              onClick={() => generateQuizQuestion(quizCourse)}
                              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10 cursor-pointer"
                            >
                              Next Question
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {customAlert && (
          <div
            onClick={() => setCustomAlert(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[280px] bg-white dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center gap-4 text-center"
            >
              {/* Premium Ambient Glows */}
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top-Right X Close Button */}
              <button
                onClick={() => setCustomAlert(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon Container */}
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl mt-2 animate-bounce">
                <Check className="w-6 h-6" />
              </div>

              {/* Text Context */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Success
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  {customAlert}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setCustomAlert(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:brightness-105 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {customConfirm && (
          <div
            onClick={() => setCustomConfirm(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[280px] bg-white dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center gap-4 text-center"
            >
              {/* Premium Warning Glow */}
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top-Right X Close Button */}
              <button
                onClick={() => setCustomConfirm(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon Container */}
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl mt-2">
                <RotateCcw className="w-6 h-6" />
              </div>

              {/* Text Context */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Reset Chat?
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  {customConfirm.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full mt-1">
                <button
                  onClick={() => setCustomConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-800 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-gray-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-650 hover:brightness-105 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

