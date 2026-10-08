'use strict';
// Admit only the requested route's known host aliases, within the same prefix.
function matchesRoute(actual, requested) {
  const got = new URL(actual),
    want = new URL(requested);
  if (
    got.origin !== want.origin ||
    got.username ||
    got.password ||
    got.search !== want.search ||
    got.hash !== want.hash
  )
    return false;
  if (!/\/(?:index|research|writing|talks|credits)\.html$/.test(want.pathname))
    throw Error('Unknown native route');
  const aliases = [want.pathname, want.pathname.slice(0, -5)];
  if (want.pathname.endsWith('/index.html')) aliases.push(want.pathname.slice(0, -10));
  return aliases.includes(got.pathname);
}
module.exports = { matchesRoute };
