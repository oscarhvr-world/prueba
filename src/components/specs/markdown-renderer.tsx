"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-dark">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
