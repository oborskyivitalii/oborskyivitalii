# Dated complete GTK lease confirmation

Full staging 37491800878 retained all Chromium/Firefox rows but the newly added
3000ms Xvfb pre-launch deadline prevented WebKit from starting. The original
engine launch budget is 30000ms. Share that unchanged budget across Xvfb and
browser launch, retaining the original 1500ms page/paint/fallback observations,
all quality/performance holds and all scenario coverage. Retain X server stderr
on a future startup failure. Do not attribute the failed 3s signal to a guessed
FD/driver defect: the real FD1/FD3 observations in DISPLAY.json pass.

One read-only fresh Linux runner confirms every 130 WebKit functional scenario,
four navigation and thirteen analytics scenarios on normal Color, using the
actual launcher, desktop GTK and a private Xvfb. Record startup timings and the
complete lease duration before deciding the next full stage. Full source
lint/security run separately. This private loopback confirmation is not hosted
full/stable acceptance. No browser warmup, retry, threshold change or deployment.
Remove this dated PR trigger after retaining all evidence.

Follow-up after incomplete 37500364739: its original dependency install consumed
22m18s and left insufficient job time; the first no-js state probe also lost its
target before cancellation. Retain GTK-INCOMPLETE.json. Correct the actual APT
mirror list as well as direct sources, bound install phases inside the unchanged
25m job, and collect native close/crash/disconnect stage evidence and stderr.
Run the same complete cold lease once on the corrected infrastructure; do not
retry scenarios or treat a green installation as functional acceptance.

Collection completed in 37505225237 at 5e4a8f6. Dependencies installed in 44s
and WebKit in 5s, but all ten no-js rows emitted native page-crash while the
other 120 functional rows passed. The 25m diagnostic cancelled during navigation;
full 130/4/13 acceptance is incomplete. GTK-FOLLOWUP.json retains every failure
and raw identities. The completed dated job and PR trigger are removed.
The next separate bounded GTK-TARGET-REQUEST.md localizes port/document/evaluator
factors; there is no unchanged full rerun or promotion from these records.
