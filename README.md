# The Scientific Teenager relay deployment

Isolated deployment branch. The normal ZeroProfit branch is unrelated and untouched.

Base source: exact attached The Scientific Teenager v1.0.2 ZIP.
Base ZIP SHA-256: `7fff5bd827e54b893d889c17cdc756f82b033fef619c4311d51631b762b93a92`
Patched source archive SHA-256: `5c64b31bcc97bd61ea9186988b9b0799a4f4daafb041a8249c0d2eb1d9a67094`

Requested behavior:
- /setup, /fix, /status, /disable in every installed guild
- /submit, /stats, /cancel, /network plus message-submit action in HQ
- per-guild command registration after Discord ClientReady and on GuildCreate
- one YES approves; NO votes do not block
- install permission includes Mention @everyone
- approved deliveries notify @everyone
- no Administrator / Manage Roles / Manage Channels permission
