import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Grid, Column, Breadcrumb, BreadcrumbItem, Tag } from "@carbon/react";
import SearchBox from "../components/SearchBox";

// --- helper functions for highlight ---
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text, query) {
  if (!query?.trim() || !text) return text;
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, "gi");
  const parts = String(text).split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i}>{part}</mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function Letter() {
  const { letter } = useParams();
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All"); // All | ML | Custom

  useEffect(() => {
    Promise.all([
      fetch("/glossary-of-research-terms/docs/index.json").then((r) =>
        r.ok ? r.json() : []
      ),
      fetch("/glossary-of-research-terms/docs/custom.json").then((r) =>
        r.ok ? r.json() : []
      ),
      fetch("/glossary-of-research-terms/docs/ml.json").then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([official, custom, ml]) => {
        const addMeta = (arr, kind) =>
          (arr || []).map((e) => ({
            ...e,
            kind:
              kind === "index"
                ? "Index"
                : kind === "custom"
                ? "Research project"
                : "Machine learning",
          }));

        const combined = [
          ...addMeta(official, "index"),
          ...addMeta(custom, "custom"),
          ...addMeta(ml, "ml"),
        ];

        const byLetter = combined.filter(
          (e) => e.term?.[0]?.toUpperCase() === letter
        );
        setEntries(byLetter);
      })
      .catch((e) => console.error("Failed to load glossary data", e));
  }, [letter]);

  // search filter
  const searchFiltered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) =>
      `${e.term} ${e.definition}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

  // category filter
  const filtered = useMemo(() => {
    if (category === "All") return searchFiltered;
    return searchFiltered.filter((e) => e.kind === category);
  }, [searchFiltered, category]);

  // counts for pills within this letter (respecting current search)
  const countsByKind = useMemo(() => {
    const base = { All: searchFiltered.length, "Machine learning": 0, "Research project": 0 };
    for (const e of searchFiltered) {
      if (e.kind === "Machine learning") base["Machine learning"]++;
      else if (e.kind === "Research project") base["Research project"]++;
    }
    return base;
  }, [searchFiltered]);

  return (
    <Grid className="cds--grid cds--grid--narrow">
      <Column lg={12} md={8} sm={4}>
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem>
            <Link to="/">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{letter}</BreadcrumbItem>
        </Breadcrumb>

        <h2>Terms under {letter}</h2>

        <div style={{ margin: "1rem 0" }}>
          <SearchBox query={query} setQuery={setQuery} />
        </div>

        {/* Category pills for this letter */}
        <div className="pill-row" style={{ marginBottom: "0.75rem" }}>
          {[
            { label: "All", key: "All" },
            { label: "Machine learning", key: "Machine learning" },
            { label: "Research project", key: "Research project" },
          ].map((p) => (
            <button
              key={p.key}
              className={`pill ${category === p.key ? "active" : ""}`}
              onClick={() => setCategory(p.key)}
              type="button"
              style={{ cursor: "pointer" }}
              aria-pressed={category === p.key}
            >
              {p.label}{" "}
              <Tag type={category === p.key ? "purple" : "gray"}>
                {countsByKind[p.key] ?? 0}
              </Tag>
            </button>
          ))}
        </div>

        <dl className="glossary-list">
          {filtered.map((e) => (
            <React.Fragment key={`${e.term}-${e.kind}`}>
              <dt>
                {highlight(e.term, query)}
                {e.kind === "Machine learning" && (
                  <Tag type="green" style={{ marginLeft: "0.5rem" }}>
                    Machine learning
                  </Tag>
                )}
                {e.kind === "Research project" && (
                  <Tag type="purple" style={{ marginLeft: "0.5rem" }}>
                    Research project
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