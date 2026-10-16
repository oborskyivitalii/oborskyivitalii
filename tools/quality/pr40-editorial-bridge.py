#!/usr/bin/env python3
"""Transfer exact PR68 authored editorial content into PR40 with bounded tests."""
from pathlib import Path
import json, subprocess
root=Path.cwd()
source="c3b8fb7d0b7a127363f24cdacb8a36c3f811054a"
files=[
  "site/content/pages/index/about.json",
  "site/content/pages/index/acknowledgements.json",
  "site/content/pages/index/contact.json",
  "site/content/pages/index/help.json",
  "site/content/pages/index/hero.json",
  "site/content/pages/index/main.json",
  "site/content/pages/research/acknowledgements.json",
  "site/templates/pages/index/acknowledgements.html",
  "site/templates/pages/research/acknowledgements.html",
]
records=[
  "review/issue-41/2026-10-10-arkadiy-amendment.json",
  "review/issue-41/2026-10-10-arkadiy-topic-amendment.json",
  "review/issue-41/2026-10-10-author-first-amendment.json",
]
def historic(path):
  return subprocess.check_output(["git","show",f"{source}:{path}"],text=True)
for name in files+records:
  dest=root/name
  dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_text(historic(name))
p=root/"tests/content.test.cjs"
target=p.read_text()
src=historic("tests/content.test.cjs")
for start,end in [
  ("test('selected Home responses link","test('research theories retain"),
  ("test('Home provides the agreed reader path","test('source-backed")
]:
  s1=src.index(start)
  d1=target.index(start)
  s2=src.find(end,s1+1)
  d2=target.find(end,d1+1)
  if s2<0:s2=src.find("\ntest(",s1+2)
  if d2<0:d2=target.find("\ntest(",d1+2)
  if s2<0:s2=len(src)
  if d2<0:d2=len(target)
  target=target[:d1]+src[s1:s2]+target[d2:]
p.write_text(target)
seo=root/"tools/check_site_seo.cjs"
s=seo.read_text()
insert="""const arkadiy = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-10-arkadiy-amendment.json'), 'utf8')
);
const arkadiyTopic = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-10-arkadiy-topic-amendment.json'), 'utf8')
);
const authorFirst = JSON.parse(
  fs.readFileSync(path.join(root, 'review/issue-41/2026-10-10-author-first-amendment.json'), 'utf8')
);
"""
needle="// Maintainer-selected #7/#39 successor on 15 October."
assert s.count(needle)==1
s=s.replace(needle,insert+needle,1)
needle="  // This successor uses current template bytes, before historical presentation reversal.\n"
assert s.count(needle)==1
s=s.replace(needle, """  // Reverse PR68 editorial successors while keeping PR40 licensing intact.
  html = restoreContentAmendment(html, page, authorFirst);
  html = restoreContentAmendment(html, page, arkadiyTopic);
  html = restoreContentAmendment(html, page, arkadiy);
"""+needle,1)
needle="          ...sitecase.changes,\n"
assert s.count(needle)==1
s=s.replace(needle,needle+"          ...arkadiy.changes,\n          ...arkadiyTopic.changes,\n          ...authorFirst.changes,\n",1)
seo.write_text(s)
review=root/"review/issue-39/2026-10-16-positioning-integration.md"
review.write_text("""# Issue39 PR40 — selected PR68 positioning integration (16 October 2026)

Owning release issue: https://github.com/oborskyivitalii/oborskyivitalii/issues/39
Editorial source: https://github.com/oborskyivitalii/oborskyivitalii/pull/68 and issue 41.
This review records the maintainer's explicit request for an integrated PR40 preview,
without stage promotion, main merge, production or DNS modification.

Input PR68 head c3b8fb7d0b7a127363f24cdacb8a36c3f811054a.
Preserved source PR40 44a9586e383c0ec2d172df5e77712e956f272f6d.
Transfer: seven canonical page JSON and two semantic acknowledgement templates.
Outcome: enterprise delivery leadership and independent research on Home;
contribution and Contact prioritize leadership/collaboration over advisory services;
Home/Research have topic-first public Thinking Systems discussion with source
links, formulation provenance and section-wide no-endorsement wording.

Exact three historical PR68 amendment records and focused content/SEO assertions
are imported, preserving PR40's licensing/analytics/rights tests.
Excluded: old Credits camera prose, stale engine changes, unrelated workflow
and runtime changes, historical retained-edition removal and general PR68 replay.
All release, native/device, rights, editorial, performance and manual gates
remain open; existing staging failures stay failed.

The implementation does not establish new third-party consent, commercial
endorsement, exact-edition approval or production eligibility. The current
CI run/artifact/preview link, when successful, is added to issue 39 and PR40.
PR68/issue41 remain open for their separate whole-issue acceptance.
""")
print("Selected 9 canonical editorial owners + 3 review records; kept PR40 release architecture.")
