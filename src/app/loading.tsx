export default function Loading() {
  return (
    <main className="page-loading" role="status" aria-live="polite">
      <span className="page-loading-spinner" aria-hidden="true" />
      <span>Loading page...</span>
    </main>
  );
}
