# greeting-lib

A minimal library repo used as a **git-dependency** to verify R3-146
(host-mediated git-repo library mounts). A consuming app declaring
`"greeting-lib": "github:immediately-run/greeting-lib#main"` should mount this repo
at `/node_modules/greeting-lib/` and render `<Greeting/>`.
