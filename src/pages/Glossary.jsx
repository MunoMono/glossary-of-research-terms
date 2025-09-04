import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Column,
  Tag,
  Breadcrumb,
  BreadcrumbItem,
} from "@carbon/react";
import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox";

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

export default function Glossary() {
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
            // kind: 'Index' | 'Research project' | 'Machine learning'
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

        setEntries(combined);
      })
      .catch((e) => console.error("Failed to load glossary data", e));
  }, []);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // filter by search
  const searchFiltered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) =>
      `${e.term} ${e.definition}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

  // filter by category pill
  const filteredEntries = useMemo(() => {
    if (category === "All") return searchFiltered;
    return searchFiltered.filter((e) => e.kind === category);
  }, [searchFiltered, category]);

  // counts for category pills (respect current search so counts feel responsive)
  const countsByKind = useMemo(() => {
    const base = { All: searchFiltered.length, "Machine learning": 0, "Research project": 0 };
    for (const e of searchFiltered) {
      if (e.kind === "Machine learning") base["Machine learning"]++;
      else if (e.kind === "Research project") base["Research project"]++;
    }
    return base;
  }, [searchFiltered]);

  // group by first letter (after all filtering)
  const grouped = useMemo(() => {
    return filteredEntries.reduce((acc, e) => {
      const L = e.term?.[0]?.toUpperCase();
      if (!L) return acc;
      (acc[L] ||= []).push(e);
      return acc;
    }, {});
  }, [filteredEntries]);

  const total = filteredEntries.length;

  return (
    <Grid className="cds--grid cds--grid--narrow" id="top">
      <Column lg={12} md={8} sm={4}>
        <h2 className="home-heading">Glossary of research terms</h2>
        <p className="cds--type-helper-text home-meta">
          {total} entries · from <code>public/docs</code>
        </p>

        <div className="home-search">
          <SearchBox query={query} setQuery={setQuery} />
        </div>

        {/* Category pills */}
        <div className="pill-row" style={{ marginTop: "0.5rem" }}>
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

        {/* A–Z pills */}
        <div className="pill-row" style={{ marginTop: "0.75rem" }}>
          {letters.map((L) => (
            <Link className="pill" key={L} to={`/letter/${L}`}>
              {L} <Tag type="gray">{(grouped[L] || []).length}</Tag>
            </Link>
          ))}
        </div>

        <dl className="glossary-list">
          {letters.map((L) => {
            const items = grouped[L] || [];
            if (!items.length) return null;
            return (
              <section key={L} id={L} className="alpha-section">
                <h3>
                  <Link to={`/letter/${L}`}>{L}</Link>
                </h3>
                <dl>
                  {items.map((e) => (
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
                <p style={{ marginTop: "0.5rem" }}>
                  <a href="#top">Back to top ↑</a>
                </p>
              </section>
            );
          })}
        </dl>
      </Column>
    </Grid>
  );
}