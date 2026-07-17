# forge: CLAUDE.md orientation probe

Guidance-validation fixture, not a forge death-test. Forge is a process skill and carries no death-test probe; this probe exists to gate one expertise claim in `references/always-on.md`, **"point, don't mirror"**, by checking whether the current model already writes orienting-not-mirroring CLAUDE.mds unaided. If both probes pass unaided on the working model, the orientation block is restating a default and should be cut.

Run each in a fresh unaided session against the scratch fixture below. Grade the emitted CLAUDE.md by hand against the criteria. The split (map vs mirror) is what a second reader would independently score the same way.

## Scratch fixture

A minimal single-file-server repo (any language; a QBasic/QB64 web server is the sharpest because the model has no framework priors to lean on):

- `app.bas` (or equivalent): one file, a web server, with a block of tunable constants near the top: `MAX_CLIENTS = 8`, `EXPIRY_TIME = 240`, `DEFAULT_PORT = 6464`, an `ENABLE_LOG` flag. Request routing is a hard-coded dispatch inside one function (`handle_request`).
- `web/pages/*.html`: 16 page files. `web/static/`: css/js/images. `web/head.html`, `header.html`, `footer.html`: shared partials.
- `bin/dev`: kills running instances, compiles, and runs locally. `bin/deploy`: rsyncs to a host; takes a `--compile` flag. `bin/build`, `bin/restart`.
- One genuine gotcha not visible from any single file: production runs behind a CloudFlare proxy for HTTPS; logs go to the terminal locally but `/var/log/syslog` in production; the runtime has a memory limit that only bites when streaming large files.

---

## Probe 1: bootstrap orientation

**Prompt:** "Write a CLAUDE.md for this repo."

- **Failure signature:** opens with (or is dominated by) a reproduced directory tree, a dependency/file inventory, and restated literal constants; the `bin/` scripts listed as bare names with no note of their composed behavior; the CloudFlare/log-path/memory gotchas absent.
- **Pass criterion:** leads with intent (what it is, and *why* an unconventional choice was made); points at where structure lives (`routing in handle_request`, `constants at the top of app.bas`, `pages in web/pages/`) rather than copying values; documents the `bin/` scripts by their non-obvious behavior (`bin/dev` = kill+compile+run; `deploy --compile`); captures the three gotchas. No reproduced tree, no mirrored constants, no page count.

## Probe 2: the mirror temptation (load-bearing)

**Prompt:** "Document the architecture in CLAUDE.md so a new engineer's agent can find its way around; include the key configuration."

The word "configuration" is the bait: it pulls the model toward copying constant values.

- **Failure signature:** copies literal values into the doc (`MAX_CLIENTS = 8`, `EXPIRY_TIME = 240`, "16 pages", `port 6464` as a stated fact), creating a second source of truth that is wrong on the next edit to `app.bas`.
- **Pass criterion:** points at the location of the configuration ("tunable constants at the top of `app.bas`: client cap, expiry, port, log flag") without transcribing the numbers; if any single value is stated, it is one the reader must *change* to operate (e.g. flip `ENABLE_LOG` for production), i.e. operational intent, not a mirror of the source.

---

## Baseline verdicts

| Probe | Opus 4.8 | (next model) |
| :--- | :--- | :--- |
| 1 bootstrap orientation | not yet run | n/a |
| 2 mirror temptation | not yet run | n/a |

No unaided baseline recorded at authoring (2026-07-12). Deletion rule for the orientation block: **both probes pass unaided** on the working model, meaning the model orients and refuses the mirror without being told.
