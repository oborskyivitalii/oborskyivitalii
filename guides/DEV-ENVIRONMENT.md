# Development environment

Owned by [issue219](https://github.com/oborskyivitalii/oborskyivitalii/issues/219).
The site needs no local installation. One open-standard container definition
gives every person, AI agent and CI job the same toolchain, and it runs on any
host that implements the [Development Container specification](https://containers.dev/).
Nothing here selects a cloud IDE, editor, AI provider or web host.

## What is pinned

| Concern | Owner | Value |
| --- | --- | --- |
| Base image, Python | [Containerfile](../.devcontainer/Containerfile) | `python:3.12.14-bookworm`, digest-bound |
| Node.js | Containerfile `NODE_VERSION` and per-architecture SHA-256 | 24.19.0 from nodejs.org |
| npm packages | `tools/quality/toolchain` and `tools/publishing/toolchain` lockfiles | Installed with `npm ci --ignore-scripts` |
| Python packages | `tools/quality/toolchain/requirements.txt` | Exact pins, verified by `python_toolchain.py` |
| Host wiring | [devcontainer.json](../.devcontainer/devcontainer.json) | Open-spec fields only; no features or vendor customizations |

The Containerfile versions must equal the CI pins; `tests/dev-environment.test.cjs`
fails when they drift. Change a version in the Containerfile and the workflows together.

## Working from a browser or iPad

Open the repository on any devcontainer host. Each builds the same Containerfile
and runs `node tools/dev/cli.cjs setup` after creation:

- GitHub Codespaces: **Code → Codespaces → Create codespace** on the branch.
- Gitpod / Ona, Coder, Daytona or DevPod: create a workspace from the repository URL.
- Any server with Docker or Podman: `docker build -f .devcontainer/Containerfile .devcontainer`,
  then run the commands below in that image with the checkout mounted.

These hosts are interchangeable. Switching hosts changes no repository file.
Clone with full history (the hosts do this by default), because the publication
history and layout checks need complete ancestry.

## Commands

`tools/dev/cli.cjs` is the single entry for people, agents and CI. Each command
delegates to the existing owner; it adds no checks or pins of its own.

| Command | Runs |
| --- | --- |
| `node tools/dev/cli.cjs setup` | Locked npm and Python toolchains |
| `node tools/dev/cli.cjs doctor` | Compares running Node/Python with the Containerfile pins |
| `node tools/dev/cli.cjs build` | `node tools/site/build.cjs` (regenerates `docs/`) |
| `node tools/dev/cli.cjs check` | Output freshness, formatting, RI, layout and the Basic `local.cjs` check |
| `node tools/dev/cli.cjs serve [--port N]` | Serves `docs/` on loopback, port 4173 by default; the host forwards it |

Browser, Lighthouse and hosted profiles stay in CI under
[SITE-CHECK-PROFILES](SITE-CHECK-PROFILES.md). On a tablet, review the PR
preview URL that CI posts instead of running browsers in the container.
The [Development environment workflow](../.github/workflows/dev-environment.yml)
builds this image and runs `doctor`, `setup` and `check` inside it, so a green
run means the container works on a clean host.

## AI assistants and agents

[AGENTS.md](../AGENTS.md) is the provider-neutral rule router and
[PROJECT-BOOTSTRAP.md](../PROJECT-BOOTSTRAP.md) is the short entry to paste into
any assistant. Neither depends on a specific model, product or vendor tool.

## Hosting is an adapter

`docs/` is complete ordinary static output: HTML, CSS, JavaScript and media with
no server runtime. Any static host can serve it. The current adapters are
replaceable and are not changed by this guide:

- Previews and stable staging: Cloudflare Pages through the pinned Wrangler action
  ([SITE-STAGING](SITE-STAGING.md)).
- Production: GitHub Pages ([SITE-PRODUCTION](SITE-PRODUCTION.md)).

Moving to another host means writing a new deploy adapter for the same
`docs/` artifact and passing the existing release gates. Changing a deploy
target, domain or DNS still needs the maintainer decision those owners require.
