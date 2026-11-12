#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const admission = require("./reviewer-admission.cjs");

function reject(code) {
  throw Object.assign(new Error(code), { admissionCode: code });
}
function safeFile(root, relative) {
  if (
    typeof relative !== "string" ||
    relative.length > 512 ||
    !relative
      .split("/")
      .every(
        (part) => /^[A-Za-z0-9_.-]+$/.test(part) && ![".", ".."].includes(part),
      )
  )
    reject("PATH");
  let current = root;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) reject("PATH");
  }
  return current;
}
function readBounded(filename, limit) {
  const descriptor = fs.openSync(
    filename,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );
  try {
    const before = fs.fstatSync(descriptor);
    if (!before.isFile() || before.size < 1 || before.size > limit)
      reject("FILE_LIMIT");
    const buffer = Buffer.alloc(before.size);
    let offset = 0;
    while (offset < buffer.length) {
      const count = fs.readSync(
        descriptor,
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!count) reject("STALE");
      offset += count;
    }
    const after = fs.fstatSync(descriptor);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs)
      reject("STALE");
    return buffer;
  } finally {
    fs.closeSync(descriptor);
  }
}
function main(argv) {
  if (argv.length !== 5) reject("USAGE");
  const [
    candidateArgument,
    evidenceArgument,
    requestPath,
    controlPath,
    controlSha256,
  ] = argv;
  // Roots are explicit trusted operator selections. Reject ancestor links too.
  const checkedRoot = (argument) => {
    const absolute = path.resolve(argument);
    safeFile(
      path.parse(absolute).root,
      absolute.slice(path.parse(absolute).root.length),
    );
    if (!fs.statSync(absolute).isDirectory()) reject("PATH");
    return absolute;
  };
  const candidate = checkedRoot(candidateArgument),
    evidence = checkedRoot(evidenceArgument);
  if (
    evidence === candidate ||
    evidence.startsWith(candidate + path.sep) ||
    candidate.startsWith(evidence + path.sep)
  )
    reject("ROOTS");
  if (requestPath === controlPath) reject("ROOTS");
  const controlBytes = readBounded(
    safeFile(evidence, controlPath),
    admission.contract.limits.requestBytes,
  );
  if (admission.hash(controlBytes) !== controlSha256) reject("CONTROL");
  const control = JSON.parse(controlBytes);
  const git = (...args) =>
    cp.execFileSync("git", args, { cwd: candidate, encoding: "utf8" }).trim();
  const [head, tree] = git("rev-parse", "HEAD", "HEAD^{tree}").split("\n");
  if (
    control.target?.head !== head ||
    control.target?.tree !== tree ||
    git("status", "--porcelain", "--untracked-files=normal") ||
    git("ls-files", "-v", "-z")
      .split("\0")
      .some((line) => /^[a-zS] /.test(line)) ||
    !/^[a-f0-9]{40}$/.test(control.target?.base) ||
    git("merge-base", control.target.base, head) !== control.target.base
  )
    reject("SOURCE");
  for (const packet of [
    ...Object.values(control.packets),
    control.preflightPacket,
  ].filter(Boolean)) {
    if (
      packet.candidateRoot !== candidate ||
      packet.evidenceRoot !== evidence ||
      !packet.output.startsWith(evidence + path.sep) ||
      path.normalize(packet.output) !== packet.output
    )
      reject("ROOTS");
  }
  const request = JSON.parse(
    readBounded(
      safeFile(evidence, requestPath),
      admission.contract.limits.requestBytes,
    ),
  );
  admission.bounded(request);
  if (
    !request ||
    Object.keys(request).sort().join(",") !== "input,journal,operation"
  )
    reject("SCHEMA");
  if (
    request.journal?.evidenceRoot &&
    request.journal.evidenceRoot !== evidence
  )
    reject("ROOTS");
  let aggregate = 0,
    count = 0;
  const cache = new Map();
  const read = (ref) => {
    admission.reference(ref);
    const key = ref.space + ":" + ref.path;
    if (cache.has(key)) {
      const bytes = cache.get(key);
      if (bytes.length !== ref.bytes || admission.hash(bytes) !== ref.sha256)
        reject("STALE");
      return bytes;
    }
    if (++count > admission.contract.limits.files) reject("FILE_LIMIT");
    const root = ref.space === "candidate" ? candidate : evidence;
    const filename = safeFile(root, ref.path);
    const size = fs.statSync(filename).size;
    if (
      size !== ref.bytes ||
      aggregate + size > admission.contract.limits.aggregateBytes
    )
      reject("FILE_LIMIT");
    aggregate += size;
    const bytes = readBounded(
      filename,
      Math.min(ref.bytes, admission.contract.limits.fileBytes),
    );
    cache.set(key, bytes);
    return bytes;
  };
  const result = admission.execute(
    request.operation,
    request.input,
    request.journal,
    read,
    control,
  );
  if (request.operation === "prepare") {
    const { outputPath } = result.prepared;
    const parent = path.dirname(outputPath);
    if (
      parent !== "." &&
      !fs.statSync(safeFile(evidence, parent)).isDirectory()
    )
      reject("OUTPUT");
    if (
      fs.lstatSync(path.join(evidence, outputPath), { throwIfNoEntry: false })
    )
      reject("OUTPUT");
  }
  return result;
}
if (require.main === module) {
  try {
    process.stdout.write(
      JSON.stringify({ ok: true, ...main(process.argv.slice(2)) }) + "\n",
    );
  } catch (error) {
    const code = /^[A-Z_]+$/.test(error.admissionCode || "")
      ? error.admissionCode
      : "INVALID_INPUT";
    process.stdout.write(
      JSON.stringify({ ok: false, status: "held", code }) + "\n",
    );
    process.exitCode = 1;
  }
}
module.exports = { main, readBounded };
