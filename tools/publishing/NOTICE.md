# Publishing helper component notice

`safety.cjs` and `provenance.cjs` adapt two code helpers from
[Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture),
commit `345c8f50745e5fde1303d0d7952634f7899220c9`:

- [`quartz/scripts/publication-path-safety.mjs`](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/quartz/scripts/publication-path-safety.mjs)
- [`quartz/scripts/publication-provenance.mjs`](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/quartz/scripts/publication-provenance.mjs)

These adapted helpers are licensed under **Apache License 2.0**. The complete
license copy is [RI-LICENSE.md](../RI-LICENSE.md); the upstream license is
[`LICENSE-CODE.md`](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/345c8f50745e5fde1303d0d7952634f7899220c9/LICENSE-CODE.md).
Keep the full license copy and this notice with redistributed adaptations.
The pinned scripts contain no additional file-level copyright or attribution
notices. Any notices added by upstream must be retained on future upgrades.

Modification notice, 2026-10-12: adapted the utilities to CommonJS and explicit
caller-owned roots. Added bounded synchronous source reading; traversal,
symbolic-link and hardlink rejection; source/output overlap checks; directory
installation with byte and inventory verification before backup removal; and
explicit recovery paths if rollback fails. Provenance now requires SHA256 and
full Git commit/blob pins for frozen editions, labels null pins as
`working-tree-review`, and permits differing committed bytes only for an
explicit `dirty-preview`. Git replacement objects cannot substitute another
tree for a declared commit. [origin.json](origin.json) records exact upstream file
hashes and the changes to each local helper.

The extraction does not copy the Quartz application or establish capability
parity with its publishing pipeline. Article content, figures, metadata and
edition permissions remain governed by their own source and rights records.
This component notice does not select a site-wide license or change the rights
of surrounding publication material.

`history.cjs` is a new site implementation of append-only event and frozen
edition checks. It is not extracted from the upstream publishing helpers.
