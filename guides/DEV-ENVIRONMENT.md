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

The Containerfile versions must equal the CI pins. `tests/dev-environment.test.cjs`
fails when the Node pin differs from any literal workflow `node-version`, or the
Python pin from the Basic lane (`site-checks.yml`). Change them together.

## Working from a browser or iPad

Open the repository on any devcontainer host. Each builds the same Containerfile
and runs `node tools/dev/cli.cjs setup` after creation:

- GitHub Codespaces: **Code → Codespaces → Create codespace** on the branch.
- Gitpod / Ona, Coder, Daytona or DevPod: create a workspace from the repository URL.
- Any server with Docker or Podman: build with
  `docker build -t author-site-dev -f .devcontainer/Containerfile .devcontainer`, then
  `docker run -it --network host -v "$PWD:/workspace" -w /workspace author-site-dev bash`.
  The image runs as the unprivileged `dev` user (uid 1000), so the checkout must be
  owned by uid 1000, or add `--user "$(id -u):$(id -g)" -e HOME=/tmp`. Without
  `--network host`, start the preview with `serve --host 0.0.0.0` and publish the port.

These hosts are interchangeable. Switching hosts changes no repository file.
Clone with full history (the hosts do this by default), because the publication
history and layout checks need complete ancestry.

## Commands

`tools/dev/cli.cjs` is the single entry for people, agents and CI. Each command
delegates to the existing owner; it adds no checks or pins of its own.

| Command | Runs |
| --- | --- |
| `node tools/dev/cli.cjs setup` | Locked npm, Python and agent-runner toolchains |
| `node tools/dev/cli.cjs doctor` | Compares `node` and the system `python3` with the Containerfile pins |
| `node tools/dev/cli.cjs build` | `node tools/site/build.cjs` (regenerates `docs/`) |
| `node tools/dev/cli.cjs check` | Formatting, RI, layout and the Basic `local.cjs` check (which includes output freshness) |
| `node tools/dev/cli.cjs serve [--port N] [--host ADDRESS]` | Serves `docs/` on loopback port 4173 by default; devcontainer hosts forward it |

Browser, Lighthouse and hosted profiles stay in CI under
[SITE-CHECK-PROFILES](SITE-CHECK-PROFILES.md). On a tablet, review the PR
preview URL that CI posts instead of running browsers in the container.
The [Development environment workflow](../.github/workflows/dev-environment.yml)
builds this image and runs `doctor`, `setup` and `check` inside it as the `dev`
user on a clean runner. It does not exercise a specific host's port forwarding or
`postCreateCommand` wiring; that remains the maintainer's device trial.

## AI assistants and agents

[AGENTS.md](../AGENTS.md) is the only rule router and `agents/reviewers/*.md` the
only role prompts. The repository tracks no runner-specific instruction files
(`CLAUDE.md`, `.opencode/`, `.cursor/` and similar); a test enforces this.
[PROJECT-BOOTSTRAP.md](../PROJECT-BOOTSTRAP.md) is the short entry for chat assistants.

Two optional runners are pinned in `tools/dev/agents` and installed by `setup`:

| Command | What it does |
| --- | --- |
| `node tools/dev/cli.cjs agents` | Generates one read-only OpenCode subagent per reviewer role from `agents/reviewers/` into `~/.config/opencode/agents/` (outside the checkout); runs after setup |
| `node tools/dev/cli.cjs opencode [ARGS]` | Pinned OpenCode; Claude Code compatibility fallbacks are disabled, so `AGENTS.md` is its only project rule file |
| `node tools/dev/cli.cjs codex [ARGS]` | Pinned Codex CLI, which also reads `AGENTS.md` |
| `node tools/dev/cli.cjs review [--base BRANCH]` | Codex review of the branch against `BRANCH` (default `main`) |

Model access is the operator's choice. OpenCode signs in with any provider,
including a ChatGPT Plus/Pro plan (`opencode providers login`, headless device
flow) or an API key; Codex uses `codex login --device-auth`. Credentials stay in
the container user's home and are never committed.

From an iPad, start the server in the container and open the forwarded port:
`OPENCODE_SERVER_PASSWORD=<secret> node tools/dev/cli.cjs opencode serve --port 4096`.
Devcontainer hosts forward 4096 privately; keep the password on any shared host.

### Cascaded review

1. The working agent follows AGENTS.md and the owning issue.
2. It launches the four repository roles as separate subagents. OpenCode documents
   that subagents start in fresh child sessions; that claimed equivalent of
   `fork_turns="none"` still needs one recorded verification under the
   [reviewer contract](../agents/reviewers/README.md) before it counts.
3. A second vendor reviews: `node tools/dev/cli.cjs review` in the container, and/or
   `@codex review` (or automatic Codex review) on the GitHub PR. Codex reads the
   `Code Review Rules` section of AGENTS.md. Its findings are inputs to the
   iteration protocol; they never approve or merge.

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
