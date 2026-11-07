# Writing discovery correction evidence

Refs #169 / PR170. Source correction follows d5e915f; the actual launch parameters
were `fork_turns="none"` for four distinct reviewer agents, with model/effort
omitted. Requirements final is a same-role continuation after its first preflight;
all other first judgments are preserved. Provider memory internals remain unknown.

Each .gz contains the complete original named report/log/packet. Decode
manifest.json.gz for exact original/archive SHA256 and byte counts. No parsed
policy, source oracle or executable source is archived.

Roles: /root/writing_requirements, /root/writing_code, /root/writing_whitebox,
/root/writing_exploratory. First three passed the scoped corrected source;
Exploratory reproduced the predecessor defect and awaits the corrected hosted URL.
A launch/hash is not an independent verdict or production approval.
