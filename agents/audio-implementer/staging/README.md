# Staging

Drop a finished sound file here once you've made it for a slot in
`../asset-list.json`.

**Name it `<slot-id>.<ext>`** — the `id` field from the ledger entry, exactly, plus
the file's real extension (`.mp3`, `.ogg`, `.wav`). The Wire stage matches files to
ledger entries by filename stem; a mismatched name means the agent can't tell which
slot it's for and will stop and ask instead of guessing.

Once the agent wires a file in, it moves the asset into
`phaser/public/audio/<category>/` and deletes it from here — an empty folder means
nothing is waiting on the agent right now, not that nothing has been made.
