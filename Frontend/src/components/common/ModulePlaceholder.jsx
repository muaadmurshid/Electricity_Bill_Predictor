import Card from "./Card";
import PageHeader from "./PageHeader";

/**
 * Used by the module pages that are not built yet.
 *
 * The spec is explicit: build one module at a time, and confirm the real
 * request/response fields against the Spring controller before wiring a
 * page up. So each page ships as a labelled shell that lists exactly
 * which backend files it needs.
 */
export default function ModulePlaceholder({ eyebrow, title, lead, needs = [], notes }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} />

      <Card title="Not built yet" subtitle="This page is the next step in the build order.">
        <div className="stack-sm">
          <p className="text-sm">
            The service file for this module already exists in{" "}
            <code>src/services/</code> with its endpoints in one place. To finish the
            page, the exact field names are needed from:
          </p>
          <ul className="stack-sm">
            {needs.map((file) => (
              <li key={file} className="row">
                <span className="badge badge-neutral">java</span>
                <span className="figure text-sm">{file}</span>
              </li>
            ))}
          </ul>
          {notes && <p className="text-sm muted">{notes}</p>}
        </div>
      </Card>
    </>
  );
}
