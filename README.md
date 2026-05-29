```
This is where I workshop skills, hooks, rules and other harness-related tools.
I access them via a Claude Code marketplace that publishes two plugins,
`cook` for the meta-forges,
`serve` for the applied skills
So I have a single source of truth and updates cascade wherever they're used.

cook is the forges that design other artifacts and serve is the skills that do
stack-specific work; I keep them split because the design layer is reusable
across any project while the applied layer is bound to a stack.

I rerun state-bump on every Claude Code release so STATE.md tracks the live
changelog and I catch any forge still built on an affordance that's gone.

```
