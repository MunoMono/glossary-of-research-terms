// src/pages/Letter.jsx
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

  useEffect(() => {
    Promise.all([
      fetch("/glossary-of-research-terms/docs/index.json").then((r) =>
        r.ok ? r.json() : []
      ),
      fetch("/glossary-of-research-terms/docs/custom.json").then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([official, custom]) => {
        const combined = [
          ...(official || []).map((e) => ({ ...e, custom: false })),
          ...(custom || []).map((e) => ({ ...e, custom: true })),
        ];
        setEntries(combined.filter((e) => e.term?.[0]?.toUpperCase() === letter));
      })
      .catch((e) => console.error("Failed to load glossary data", e));
  }, [letter]);

  // Filter entries by query
  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) =>
      `${e.term} ${e.definition}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

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

        <dl className="glossary-list">
          {filtered.map((e) => (
            <React.Fragment key={e.term}>
              <dt>
                {highlight(e.term, query)}
                {e.custom && (
                  <Tag type="purple" style={{ marginLeft: "0.5rem" }}>
                    Custom
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