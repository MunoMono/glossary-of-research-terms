// src/pages/Glossary.jsx
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
        setEntries(combined);
      })
      .catch((e) => console.error("Failed to load glossary data", e));
  }, []);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredEntries = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) =>
      `${e.term} ${e.definition}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

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

        <div className="pill-row">
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