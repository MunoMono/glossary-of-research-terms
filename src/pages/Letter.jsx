import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Grid, Column, Breadcrumb, BreadcrumbItem, Tag } from "@carbon/react";

export default function Letter() {
  const { letter } = useParams();
  const [entries, setEntries] = useState([]);

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

        <dl className="glossary-list">
          {entries.map((e) => (
            <React.Fragment key={e.term}>
              <dt>
                {e.term}
                {e.custom && (
                  <Tag type="purple" style={{ marginLeft: "0.5rem" }}>
                    Custom
                  </Tag>
                )}
              </dt>
              <dd>{e.definition}</dd>
              <dd className="entry-source">{e.source}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Column>
    </Grid>
  );
}