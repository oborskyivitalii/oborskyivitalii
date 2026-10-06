# Dated display-start observation

Full staging 37491800878 at 4c05087e retains 260 passing Linux functional rows,
8 passing navigation rows and 26 passing analytics rows. WebKit never starts:
the new private Xvfb launcher exceeds its 3000ms readiness bound. Linux Color
12/12, Windows 40/8/26, macOS 20/4/13, static, host, captures and performance
pass. The full gate fails and promotion is skipped; stable and main are unchanged.

Observe one original stdout-FD launch, one dedicated-FD launch and the previously
successful packaged xvfb-run method on each of two fresh Linux runners, in
opposite order. No browser is launched. Preserve stdout/stderr and the original
3000ms result; observation can continue to 10000ms to locate a slow/absent signal,
which never converts an original timeout into a pass. Check an actual X client
connection and clean up only each owned process group. Keep all observations,
source/tree and environment. Collection green is not full acceptance. Remove
this dated PR trigger after retaining the evidence and before another full stage.
