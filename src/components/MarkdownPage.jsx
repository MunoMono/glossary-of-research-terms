import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function injectVariables(markdown, variables) {
  if (!markdown) return "";
  return Object.entries(variables || {}).reduce((acc, [key, value]) => {
    const safeValue = value ?? "";
    return acc.replaceAll(`{{${key}}}`, String(safeValue));
  }, markdown);
}

export default function MarkdownPage({ page, variables = {} }) {
  const [rawMarkdown, setRawMarkdown] = useState("");

  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";
    fetch(`${base}pages/${page}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${page}.md`);
        return res.text();
      })
      .then(setRawMarkdown)
      .catch((err) => {
        console.error(`Unable to load markdown page "${page}"`, err);
        setRawMarkdown("");
      });
  }, [page]);

  const variablesKey = useMemo(
    () => JSON.stringify(variables || {}),
    [variables]
  );

  const content = useMemo(
    () => injectVariables(rawMarkdown, variables),
    [rawMarkdown, variablesKey]
  );

  if (!content) return null;

  return (
    <ReactMarkdown
      className="carbon-markdown markdown-body"
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
