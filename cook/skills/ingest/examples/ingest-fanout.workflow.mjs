// ingest-fanout.workflow.mjs — worked example for workflow-forge.
//
// This is `/ingest`'s "fan-out-and-synthesize" expressed as a dynamic workflow:
// one forked reader per source (parallel), then a single bounded synthesis (barrier).
// It's the JS-runtime counterpart to the prose-dispatched Research-orchestrator skill
// at cook/skills/ingest/ — see workflow-forge's SKILL.md for when to cross that line.
//
// STATUS: authored against the Workflow runtime (Claude Code v2.1.154+, research preview).
// Authored, NOT yet run end-to-end — running a workflow needs an explicit opt-in
// ("ultracode" / "use a workflow"). Treat it as a template, not a verbatim script:
// adjust the schema, agentType, and synthesis prompt to the corpus.
//
// Invoke with args = { topic: string, sources: string[] }.

export const meta = {
  name: 'ingest-fanout',
  description: 'Read N sources in parallel (one forked reader each), then synthesize a bounded, cited brief',
  phases: [
    { title: 'Read', detail: 'one forked reader per source — verbatim quotes only' },
    { title: 'Synthesize', detail: 'agreement / contention / rough-edge brief from all readers' },
  ],
}

const topic = args?.topic ?? 'the target topic'
const sources = Array.isArray(args?.sources) ? args.sources : []

if (!sources.length) {
  log('No sources supplied — nothing to ingest.')
  return { topic, sources: [], brief: null }
}

// The schema is the quote-only contract made STRUCTURAL: there is no free-text field to
// smuggle a paraphrase or a summary into, and every excerpt must carry the heading it came
// from. This is the workflow form's advantage over a prose dispatch — the contract is
// enforced by validation (the agent retries on mismatch), not by the reader's goodwill.
const EXCERPTS = {
  type: 'object',
  additionalProperties: false,
  required: ['source', 'status', 'excerpts'],
  properties: {
    source: { type: 'string' },
    status: {
      type: 'string',
      enum: ['ok', '404', 'paywalled', 'redirected', 'out-of-scope', 'other'],
    },
    excerpts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['quote', 'section'],
        properties: {
          quote: { type: 'string' },   // verbatim, <= 100 words
          section: { type: 'string' }, // heading/section it appeared under
        },
      },
    },
  },
}

phase('Read')
// Fan-out. One reader per source, each in its own fresh context (the "lost in the middle"
// defense — no 100k-token pile to lose information in). agentType 'Explore' is read-only
// and has WebFetch. opts.phase is set explicitly so the progress group is correct even
// though these run concurrently inside parallel().
const reads = await parallel(sources.map((src, i) => () =>
  agent(
    `Read ONLY the source at ${src} and extract 3-8 verbatim passages (<= 100 words each) ` +
    `directly relevant to: ${topic}. Tag each with the heading it appeared under. ` +
    `No paraphrase, no summary, no commentary. If the source is irrelevant, set status ` +
    `"out-of-scope" with zero excerpts. If unreachable/paywalled, set status accordingly ` +
    `and quote only what is visible.`,
    { label: `read:${i + 1}`, phase: 'Read', schema: EXCERPTS, agentType: 'Explore' },
  ),
))

const got = reads.filter(Boolean) // a reader that errored resolves to null
const withExcerpts = got.filter((r) => r.excerpts?.length)
log(`${withExcerpts.length}/${sources.length} sources returned excerpts`)

phase('Synthesize')
// A BARRIER is correct here, and this is the rare case that justifies one: synthesis needs
// EVERY reader's excerpts at once. "Points of agreement" = claims >= 2 sources support;
// "contention" = where they disagree. You cannot compute either streaming one source at a
// time — the all-at-once result of parallel() above is the point, not a convenience.
const brief = await agent(
  `Assemble a grounded brief on: ${topic}.\n\n` +
  `Per-source verbatim excerpts (JSON):\n${JSON.stringify(got, null, 2)}\n\n` +
  `Sections: (1) Sources consulted, with status; (2) Points of agreement — claims >= 2 ` +
  `sources support, quotes inlined; (3) Points of contention — both sides quoted; ` +
  `(4) The rough edge — 2-4 sentences on what these sources add beyond training priors ` +
  `(if you can't fill it, say so plainly); (5) Open questions. Keep agreement + contention ` +
  `under ~2,000 tokens; raise the relevance bar rather than expand. Quotes, not paraphrase.`,
  { label: 'synthesize', phase: 'Synthesize' },
)

// Workflows have no filesystem access — the script returns the brief and the MAIN THREAD
// writes it to .claude/ingest/<slug>.md and runs the confirm-before-handoff step. The
// workflow does the expensive fan-out; the durable side effects stay outside it.
log(brief ? `Brief assembled on "${topic}".` : 'No brief produced.')
return { topic, sources: got, brief }
