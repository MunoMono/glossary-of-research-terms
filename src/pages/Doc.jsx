import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Grid,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonSet,
} from "@carbon/react";
import { Download, Document } from "@carbon/icons-react";
import SearchBox from "../components/SearchBox";
import { convertMarkdownToDocx, downloadDocx } from "@mohtasham/md-to-docx";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- frontmatter helpers ---
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*([\s\S]*?)\s*---/);
  if (!m) return {};
  const block = m[1];
  const out = {};
  block.split(/\r?\n/).forEach((line) => {
    const mm = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);
    if (!mm) return;
    const k = mm[1];
    let v = mm[2] || "";
    v = v.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    out[k] = v;
  });
  return out;
}
function stripFrontmatter(raw) {
  return raw.replace(/^---[\s\S]*?---\s*/, "");
}
function stripLeadingH1(s, title) {
  if (!s) return s;
  if (title) {
    const re = new RegExp(`^\\s*#\\s+${escapeRegExp(title)}\\s*\\n+`, "i");
    if (re.test(s)) return s.replace(re, "");
  }
  return s.replace(/^\s*#\s+.+\n+/, "");
}
function formatUpdated(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString(undefined, { month: "short" });
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

// --- lightweight rehype plugin to highlight text nodes ---
function rehypeHighlight(query) {
  const q = query?.trim();
  if (!q) return () => () => {};
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");

  return () => (tree) => {
    function visit(node) {
      if (!node) return;
      if (node.type === "text") {
        const parts = String(node.value).split(re);
        if (parts.length > 1) {
          node.type = "element";
          node.tagName = "span";
          node.properties = node.properties || {};
          node.children = parts
            .filter((p) => p !== "")
            .map((part) =>
              re.test(part)
                ? {
                    type: "element",
                    tagName: "mark",
                    properties: { className: ["doc-highlight"] },
                    children: [{ type: "text", value: part }],
                  }
                : { type: "text", value: part }
            );
          delete node.value;
        }
      } else if (node.children && Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }
    visit(tree);
  };
}

export default function Doc() {
  const { letter, slug } = useParams();
  const [md, setMd] = useState("# Loading…");
  const [meta, setMeta] = useState(null);
  const [updatedFromMd, setUpdatedFromMd] = useState("");
  const [query, setQuery] = useState("");

  const base = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    let titleFromMeta = "";
    setQuery(""); // reset per document

    fetch(`${base}docs/index.json`, { cache: "no-cache" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`index ${r.status}`))
      )
      .then((idx) =>
        idx?.entries?.find((e) => e.letter === letter && e.slug === slug)
      )
      .then((m) => {
        setMeta(m || null);
        titleFromMeta = m?.title || "";
        return fetch(`${base}docs/${letter}/${slug}.md`, {
          cache: "no-cache",
        });
      })
      .then((r) =>
        r.ok ? r.text() : Promise.reject(new Error(`md ${r.status}`))
      )
      .then((raw) => {
        const fm = parseFrontmatter(raw);
        const ts = fm.last_updated || fm.lastUpdated || "";
        setUpdatedFromMd(ts);

        const withoutFM = stripFrontmatter(raw);
        const cleaned = stripLeadingH1(withoutFM, titleFromMeta);
        setMd(cleaned || "# Not found");
      })
      .catch((err) => {
        console.error("Doc load failed:", err);
        setMd("# Not found");
      });
  }, [letter, slug, base]);

  const updatedPretty =
    formatUpdated(updatedFromMd) || formatUpdated(meta?.last_updated);

  // Build the plugin list; include highlighter only when query present
  const rehypePlugins = useMemo(() => {
    return query.trim() ? [rehypeHighlight(query)] : [];
  }, [query]);

  // --- PDF download handler ---
  function handleDownloadPdf() {
    window.print();
  }

  // --- DOCX download handler (Markdown → DOCX, client-side) ---
  async function handleDownloadDocx() {
    try {
      const titleLine = meta?.title ? `# ${meta.title}\n\n` : "";
      const headerMeta =
        meta?.authors || meta?.year || meta?.venue
          ? `_${[
              meta?.authors,
              meta?.year ? `(${meta.year})` : null,
              meta?.venue ? `— ${meta.venue}` : null,
            ]
              .filter(Boolean)
              .join(" ")}_\n\n`
          : "";
      const markdown = `${titleLine}${headerMeta}${md}`;

      const blob = await convertMarkdownToDocx(markdown);
      const fnameBase = `${(meta?.authors || slug)
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]+/g, "")}${meta?.year ? `_${meta.year}` : ""}`;
      downloadDocx(blob, `${fnameBase || slug}.docx`);
    } catch (err) {
      console.error("DOCX export failed:", err);
      alert("Sorry — DOCX export failed. See console for details.");
    }
  }

  return (
    <Grid className="cds--grid cds--grid--narrow">
      <Column lg={12} md={8} sm={4}>
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem>
            <Link to="/">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={{ pathname: "/", hash: `#${letter}` }}>{letter}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{meta?.title || slug}</BreadcrumbItem>
        </Breadcrumb>

        <div className="doc-header">
          <h2>{meta?.title || slug}</h2>

          {(meta?.authors || meta?.year || meta?.venue || meta?.doi) && (
            <p className="doc-meta">
              {meta?.authors}
              {meta?.year ? ` (${meta.year})` : ""}
              {meta?.venue ? ` — ${meta.venue}` : ""}
              {meta?.doi ? ` · DOI: ${meta.doi}` : ""}
            </p>
          )}

          {updatedPretty && (
            <p className="doc-meta doc-revision">Last revision: {updatedPretty}</p>
          )}

          {/* Inline search for this document */}
          <div style={{ margin: "1rem 0" }}>
            <SearchBox query={query} setQuery={setQuery} />
          </div>

          {/* Export actions */}
          <ButtonSet className="doc-actions" style={{ margin: "0.5rem 0 1rem" }}>
            <Button kind="tertiary" renderIcon={Download} onClick={handleDownloadPdf}>
              Download PDF
            </Button>
            <Button kind="tertiary" renderIcon={Document} onClick={handleDownloadDocx}>
              Download DOCX
            </Button>
          </ButtonSet>

          <hr className="doc-separator" />
        </div>

        <div className="carbon-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}>
            {md}
          </ReactMarkdown>
        </div>
      </Column>
    </Grid>
  );
}