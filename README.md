# m2-subapp — the callee half of the M2 delegation fixture

This branch is **not** the greeting library. `greeting-lib@main` is a tiny library used by
the R3-146 host-mediated library-mount check and is untouched; this branch reuses the repo
to host a second, unrelated fixture so no new repository had to be created.

It is the **callee** in the M2 attenuated-delegation live fixture
(`M2_DELEGATION_STATUS` step 4, driven by roadmap item R3-43 drill 2). Another app
(`agent-demo`) invokes it with `invokeTask("probe", …)`; the host mints this app a
**delegated** `net:fetch` grant that is the intersection of what this app declares and
what the caller already holds.

It then **spends** that capability rather than just reporting it, because a grant that was
minted but not honoured and one that was honoured but not scoped look identical from the
outside. It fetches:

| host | declared? | expected |
|---|---|---|
| `https://example.com` | yes | reachable |
| `https://example.org` | **no** | **blocked** — this is the attenuation check |

Reaching the undeclared host would mean the delegated grant was inherited rather than
attenuated, which is the failure this fixture exists to catch.

`requests."net:fetch"` is `required: true`, so an invocation by a caller that does not
itself hold a covering grant must be refused with `consent-required` **before this code
loads at all** — the negative leg of the drill.

Durable fixture: do not delete this branch.
