// src/pages/Letter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Grid, Column, Breadcrumb, BreadcrumbItem, Tag } from "@carbon/react";
import SearchBox from "../components/SearchBox";

// ---- local utils (kept inline so you don't need extra files) ----
const BASE = "/glossary-of-research-terms"; // works on GH Pages + local dev

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text, query) {
  if (!query?.trim() || !text) return text;
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, "gi");
  const parts = String(text).split(re);
  return parts.map((part, i) =>
    re.test(part) ? <mark key={i}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}
function tagTypeForKind(kind) {
  if (kind === "Machine learning") return "green";
  if (kind === "Research project") return "purple";
  if (kind === "SQL") return "blue";
  return "gray";
}

export default function Letter() {
  const { letter } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All"); // "All" or any dataset title from index.json

  // load datasets dynamically from index.json
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const idxRes = await fetch(`${BASE}/docs/index.json`);
        const index = idxRes.ok ? await idxRes.json() : [];
        if (cancelled) return;

        const payloads = await Promise.all(
          (index || []).map(async (d) => {
            try {
              const r = await fetch(`${BASE}${d.src}`);
              const json = r.ok ? await r.json() : [];
              // attach dataset title as kind
              return json.map((e) => ({ ...e, kind: d.title || d.key || "Dataset" }));
            } catch {
              return [];
            }
          })
        );

        if (cancelled) return;

        // merge and scope by letter immediately
        const merged = payloads.flat();
        const byLetter = merged.filter((e) => e.term?.[0]?.toUpperCase() === letter);
        // sort stable by term
        byLetter.sort((a, b) => (a.term || "").localeCompare(b.term || "", undefined, { sensitivity: "base" }));
        setEntries(byLetter);
      } catch (e) {
        if (!cancelled) setErr("failed to load datasets");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [letter]);

  // search filter
  const searchFiltered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) => `${e.term} ${e.definition}`.toLowerCase().includes(q));
  }, [entries, query]);

  // counts for category pills (responsive to search)
  const countsByKind = useMemo(() => {
    const base = { All: searchFiltered.length };
    for (const e of searchFiltered) {
      base[e.kind] = (base[e.kind] || 0) + 1;
    }
    return base;
  }, [searchFiltered]);

  // visible list by category
  const filtered = useMemo(() => {
    if (category === "All") return searchFiltered;
    return searchFiltered.filter((e) => e.kind === category);
  }, [searchFiltered, category]);

  // stable list of kinds for pill order (alpha)
  const kindKeys = useMemo(
    () => Object.keys(countsByKind).filter((k) => k !== "All").sort((a, b) => a.localeCompare(b)),
    [countsByKind]
  );

  return (
    <Grid className="cds--grid cds--grid--narrow">
      <Column lg={12} md={8} sm={4}>
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem>
            <Link to="/">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{letter}</BreadcrumbItem>
        </Breadcrumb>

        <h2 style={{ display: "flex", alignItems: "baseline", gap: ".5rem" }}>
          Terms under {letter}
          <span className="cds--type-helper-text" style={{ fontWeight: 400 }}>
            {loading ? "loading…" : `· ${filtered.length} entries`}
            {err ? <span style={{ color: "crimson", marginLeft: 8 }}>({err})</span> : null}
          </span>
        </h2>

        <div style={{ margin: "1rem 0" }}>
          <SearchBox query={query} setQuery={setQuery} />
        </div>

        {/* Category pills for this letter (dynamic from datasets) */}
        <div className="pill-row" style={{ marginBottom: "0.75rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <button
            className={`pill ${category === "All" ? "active" : ""}`}
            onClick={() => setCategory("All")}
            type="button"
            style={{ cursor: "pointer" }}
            aria-pressed={category === "All"}
          >
            All <Tag type={category === "All" ? "purple" : "gray"}>{countsByKind["All"] ?? 0}</Tag>
          </button>

          {kindKeys.map((k) => (
            <button
              key={k}
              className={`pill ${category === k ? "active" : ""}`}
              onClick={() => setCategory(k)}
              type="button"
              style={{ cursor: "pointer" }}
              aria-pressed={category === k}
            >
              {k} <Tag type={category === k ? tagTypeForKind(k) : "gray"}>{countsByKind[k] ?? 0}</Tag>
            </button>
          ))}
        </div>

        <dl className="glossary-list">
          {filtered.map((e, idx) => (
            <React.Fragment key={`${e.term}-${e.kind}-${idx}`}>
              <dt>
                {highlight(e.term, query)}
                {e.kind && (
                  <Tag type={tagTypeForKind(e.kind)} style={{ marginLeft: "0.5rem" }}>
                    {e.kind}
                  </Tag>
                )}
              </dt>
              <dd>{highlight(e.definition, query)}</dd>
              <dd className="entry-source">{e.source}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Column>
    </Grid>
  );
}
