// The M2 attenuated-delegation SUB-APP (R3-43 drill 2 / M2_DELEGATION_STATUS step 4).
//
// This is the *callee* half of the live two-app fixture. It exists to prove one thing
// end to end that unit tests can only prove in pieces: that when an app invokes a task,
// the host mints the callee a **delegated** grant that is the INTERSECTION of what the
// callee requests and what the caller already holds — never more.
//
// Why the app has to actually spend the capability. It would be easy to write a fixture
// that only *declares* `net:fetch` and reports what the host told it. That proves the
// paperwork, not the authority: a delegated grant that was minted but not honoured, or
// honoured but not scoped, would both look identical. So this app performs a REAL
// `hostFetch` to the one host it declared, and reports the outcome. The three cases are
// then distinguishable from the outside:
//
//   delegated + honoured   → the fetch returns a status
//   not delegated          → the invocation never gets here (caller sees consent-required)
//   delegated but mis-scoped → a fetch to the OTHER host below fails while the first
//                              succeeds, which is what "attenuated" has to mean
//
// It holds NO standing authority of its own: everything it can reach, it can reach only
// because the caller held it first and the host narrowed it (§5.7 — data crosses, ambient
// authority does not). Its manifest asks for `net:fetch` as `required: true`, so an
// invocation by a caller lacking it must be refused BEFORE this code ever loads.
import { useCallback, useEffect, useState } from "react";
import { completeTask, cancelTask, hostFetch, useTaskInput } from "@immediately-run/sdk";

/** The host this app declares in `immediately.run.requests` — the one it may reach. */
const DECLARED_HOST = "https://example.com/";

/**
 * A host this app deliberately does NOT declare. Fetching it must fail even when the
 * caller itself holds a broader grant — that is the difference between "delegated" and
 * "inherited", and it is the whole point of attenuation. A fixture that only probed the
 * allowed host could not tell the two apart.
 */
const UNDECLARED_HOST = "https://example.org/";

type Probe = { url: string; ok: boolean; detail: string };

const probe = async (url: string): Promise<Probe> => {
  try {
    const res = await hostFetch(url, { method: "GET" });
    return { url, ok: true, detail: `HTTP ${res.status}` };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    return { url, ok: false, detail: code ?? (e as Error)?.message ?? "error" };
  }
};

export default function App() {
  const input = useTaskInput() as { label?: string } | null;
  const [probes, setProbes] = useState<Probe[] | null>(null);

  useEffect(() => {
    let live = true;
    // Both probes run on mount so the result is a MEASUREMENT, not a button someone
    // forgot to press during a drill.
    Promise.all([probe(DECLARED_HOST), probe(UNDECLARED_HOST)]).then((rs) => {
      if (live) setProbes(rs);
    });
    return () => {
      live = false;
    };
  }, []);

  const finish = useCallback(() => {
    const declared = probes?.find((p) => p.url === DECLARED_HOST);
    const undeclared = probes?.find((p) => p.url === UNDECLARED_HOST);
    // The result is DATA the caller can render — never authority. The host re-validates
    // it against the `probe` contract before the caller's promise resolves.
    completeTask({
      probed: true,
      declaredHostOk: !!declared?.ok,
      declaredDetail: declared?.detail ?? "not run",
      // `false` here is the PASS condition: reaching an undeclared host would mean the
      // delegated grant was not attenuated.
      undeclaredHostOk: !!undeclared?.ok,
      undeclaredDetail: undeclared?.detail ?? "not run",
    });
  }, [probes]);

  return (
    <main style={{ font: "14px/1.5 system-ui, sans-serif", padding: 24, maxWidth: 620 }}>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>M2 delegation probe</h1>
      <p style={{ opacity: 0.7, margin: "0 0 16px" }}>
        The callee half of the M2 live fixture{input?.label ? ` — ${input.label}` : ""}. It
        spends the <code>net:fetch</code> the host delegated to it, and reports what it
        could and could not reach.
      </p>

      {probes === null ? (
        <p>probing…</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
          {probes.map((p) => (
            <li key={p.url} style={{ margin: "0 0 8px" }}>
              <code>{p.url}</code>
              <br />
              <strong style={{ color: p.ok ? "#16a34a" : "#dc2626" }}>
                {p.ok ? "reachable" : "blocked"}
              </strong>{" "}
              <span style={{ opacity: 0.7 }}>({p.detail})</span>
              {p.url === UNDECLARED_HOST && (
                <span style={{ opacity: 0.7 }}>
                  {" "}
                  — undeclared; <em>blocked</em> is the expected result
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={finish} disabled={probes === null}>
        Return result to caller
      </button>{" "}
      <button type="button" onClick={() => cancelTask()}>
        Cancel
      </button>
    </main>
  );
}
