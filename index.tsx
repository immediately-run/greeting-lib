// Default export (immediately.run apps use default exports; the git-mounted module
// resolves this via package.json "main").
export default function Greeting({ name }: { name: string }) {
  return (
    <div
      data-testid="mounted-lib"
      style={{ padding: 24, fontFamily: "monospace", color: "limegreen", fontSize: 26, fontWeight: 700 }}
    >
      MOUNTED LIBRARY RENDERED ✓ — {name}
    </div>
  );
}
