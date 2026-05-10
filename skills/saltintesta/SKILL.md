---
name: saltintesta
description: "This skill encodes ways to produce written tone of voice that articulates ideas in as few good words as possible, built on the idea of 'Saltintesta' put forward in Paul Graham's 'Write Simply'. Use when drafting any prose meant to be read with attention, including articles, essays, posts, newsletters, talks, or anything similar, even when the ask is just 'write something on X.'"
when_to_use: |
  - "write something on X"
  - "draft a piece about Y"
  - "rewrite this paragraph"
  - "tighten this writing"
  - "make this less AI-sounding"
  - "pass this through saltintesta"
  - drafting any prose meant to be read with attention, including but not limited to blog posts, essays, newsletters, talks, and social posts
---

# Writing Voice

Good writing pushes ideas into your head withiut noticing the words that got you there.

That sounds easy and isn't. Plain writing is hard because writing isn't transcription. You don't sit down with the ideas already formed and pour them out clean. Half the ideas in any decent piece show up while you're writing it. The first version of a sentence is usually wrong. The first attempt at an opening paragraph is usually a guess at what the piece is about. So if your attention is going to "does this sound AI", it isn't going to "have I figured out what I think yet". The two compete, and the second one matters more.

## Have something to say

The first failure mode of AI-assisted writing is producing middlebrow consensus shaped like the prompt. Plausible, fluent, saying nothing. The sentences are correct. They're also things everyone already agrees on, so they're not useful.

Useful means true, strong, important, and at least slightly novel. True is just correct. Strong means as strong as the claim can be without becoming false; weaker than that is hedging. Important means it's about something that matters. Novel means the reader didn't already know it. Sometimes they knew it unconsciously and never put it into words. That still counts.

Before drafting, do two things.

First, state the claim. One sentence: what's true and at least slightly novel about the topic? If you can write that sentence honestly, you have something to say. If you can't, don't fabricate one and dress the prose around it. Stop and ask the user what they actually think about the topic, then write their angle. Faking conviction shows up in the prose; the reader can feel it even when they can't name it.

Second, frame the piece. What question is the piece answering, and where should the reader be at the end that they weren't at the start? Knowing those two things before drafting is what makes a piece go somewhere instead of meander. Voice fixes the local; structure fixes the global. A piece can be saltintesta-clean sentence by sentence and still wander.

## Respect the brief

The brief sets shape, not just topic. "A short note." "A tweet." "Three bullets." "A paragraph." Those are length caps, not soft preferences. Without paying attention, prose drifts toward whatever shape that kind of piece usually takes — the README voice, the essay voice, the post voice — even when the brief says short. That drift is the failure mode.

Before drafting, write the minimum-viable version. One sentence, two sentences, whatever the brief implies. If that conveys what's needed, ship it. Don't add prose to fill space the brief didn't ask for.

When you do add, ask: am I adding this because the piece needs it, or because pieces of this kind usually have it? A header, an inviting close, a three-verb call-to-action belong to the genre, not necessarily to this piece. A three-line README doesn't need a tagline or an outro. Add them only when something specific is missing without them.

The diagnostic tell: an opening that names the topic, a body that defends the framing, a closing line for emphasis. When all three appear in something the brief asked to be short, that's the genre talking, not the piece. Strip it back to what the brief asked for.

## Write like you'd say it

This is the easiest filter and most of the work. After every sentence: would I say this to a friend, in conversation, out loud? If the answer is no, you'll hear the clank when the sentence hits the page. Replace it with the way you'd actually say it.

People reach for formal vocabulary and complicated sentence shapes the moment they start writing. Don't. The harder the idea, the more informally experts tend to talk about it, because the language can't afford to get in the way. Use plain Germanic words: write, not pen; help, not assist; show, not demonstrate. Use contractions. Start sentences with And or But or So when that's how the thought lands. Don't try to sound impressive.

For taste anchors, look at Karri Saarinen on the Linear blog, Josh Comeau, the Linear and Cursor editorial pages, Dan Shipper. They write articulate, stripped-down prose. Real thinking underneath. No flourish for its own sake.

## Bad first draft, then three passes

Write the bad version fast. Don't outline in detail; the outline will turn out to be wrong because most of the ideas haven't happened yet. Get something on the page. The first words are usually wrong, and that's normal. You'll fix them in the passes.

Then run three passes in this order. Skipping one is the most common reason a draft ships still sounding AI.

The stranger reread. Pretend you know nothing of what's in your head; read only what's on the page. Does it make sense? Is anything missing? Is anything padding? Does any claim feel wrong now you read it back? The news on the first reread is almost always bad. Good, the test is working. The stranger is rational; satisfy them by adding what they need and cutting what they don't. Most of editing is cutting; be willing to cut nice sentences that aren't doing informational work.

The tells sweep. Walk the list of AI tells below. Em-dashes, "not X but Y," the setup-disclaimer-reveal, dramatic-pause commas, comma-stacked openers, and the rest. Find each one and rewrite around it.

The final check. Three questions. Would this embarrass me said aloud to a friend? Does anything catch on the reread? Is every claim as strong as it can be without being false? If any answer is no, go back. If all are yes, ship.

## What sentences do

Trust the reader. Skip the softening, the justification, the hand-holding. If you'd cut it explaining the same idea over dinner, cut it here.

After every sentence, ask: what does this say that the previous sentence didn't? If the answer is rhythm, emphasis, or "lands the close," cut it. The reader skips vibe-only sentences anyway. This check has to fire at draft time, not just in the after-pass — the rhythm sentence you write at draft time is the one you'll defend in the after-pass, because it now feels load-bearing.

Specific beats vague. Name the thing. The architect designing a sculptural house in a town of traditional cabins, not "a stakeholder navigating constraints." Cursor's agent mode with Claude Sonnet, not "modern AI tooling." Pike's Peak is near the middle of Colorado. Not "somewhere in Colorado." Not "the exact middle," because that goes too far and becomes false.

Build arguments through stacked concrete examples. Karri does this: the architect, the sushi chef, the cabinetmaker, the kitchen. Josh names specific developers, cites specific studies, points to specific tools. Abstraction without grounding doesn't land.

Embed metaphors; don't announce them. When the piece is built around a metaphor (a workshop, a kitchen, a dance), work it into a sentence rather than declare it. "I run a workshop in the garage" embeds. "This is a workshop, not a hardware store" announces, then defends, then reveals. The announced metaphor reaches for drama. The embedded one just talks. Tell: if the metaphor needs its own sentence to introduce it, you're announcing.

First person. Own the claim. "I think." "My feeling is." "I might be proven wrong." They mark precise certainty. They beat hiding behind "one might consider" or "it could be argued."

Active voice. Human subjects. People doing things. Don't let "the decision emerges" past you; find the actor. A calm sentence stating the view directly is almost always stronger than a louder one trying to perform conviction.

Match rhythm to ideas. Simple thought, short sentence. Subtle thought, a longer sentence that teases the implications out. Don't let three sentences in a row land at the same length. Don't end every paragraph on a punchy one-liner; that's pull-quote energy and the reader can feel it. Read the draft aloud. If a sentence doesn't sound like speech, rewrite it. Phonetic awkwardness almost always means the idea is wrong too. Fix the sound, you tend to fix the idea.

## The tells of AI prose

These are everywhere in machine-generated text. Each one announces a sentence wasn't paid attention to. Each one is fixable.

The setup-disclaimer-reveal is the worst. It looks like considered prose. It isn't. Shape: declarative statement, em-dash or comma, "not as [a disowned interpretation], but [the 'real' reason]." Canonical example: _"The honest move is to refuse the flattening — not as a dodge, but because the flatness wasn't there to begin with."_ The sentence defends itself against an objection no one made, then resolves with a phrase engineered to sound profound. The drama comes from the structure, not the idea. Substance version: _"I'll resist flattening this. I don't need to."_ Two short sentences. The point arrives directly. Watch for the pattern even when the words change. The tells: a grand declarative opener, a pause for effect, a "not [thing nobody asked you about], but [elevated reason]." When you spot it, restate the actual point in plain language and delete the rest.

Em-dashes are the second worst. A comma, period, or restructure does the work without the drama.

"Not X, but Y" and "not X, it's Y" belong to the same family as the setup-disclaimer-reveal. State Y.

Dramatic-pause commas perform pacing the prose hasn't earned. "The work shows up, in the small choices, in the moments no one sees." Restructure to one clean sentence.

Comma-stacked openers are taglines pretending to be sentences. "First-person, articulate but stripped down, conviction without bombast." Pick one descriptor, lead with it as a full sentence with a verb.

Don't open with storytelling, scene-setting, or framing devices. This is information transfer. Don't open with a scene unless the scene is the point.

Don't write meta-commentary about the writing. "In this piece...", "What follows is...", "I want to talk about..." Just write the piece.

Anything that reads like marketing copy is marketing copy.

If a sentence sounds engineered to be screenshotted, rewrite it.

"Every," "always," "never" overclaim. Replace with the actual detail.

Adverbs are usually filler. Cut them unless they're load-bearing.

Wh- sentence starts ("What's important here is...", "Where this falls apart is...") buy time. Cut to the point.

Throat-clearing openers ("Here's the thing", "What's interesting is", "It's worth noting") do the same. Cut.

Passive voice hides the actor. Find the actor.

Inanimate nouns shouldn't do human verbs. "The decision emerges" has no human in it. Find the human.

Narrator-from-a-distance voice ("Nobody designed this") keeps the reader at arm's length. Put yourself or the reader in the scene.

Don't make three-item lists where two would do. The third is rhythm filler.

## Shake the bin

Any arbitrary constraint that forces a rewrite, like making something shorter or rephrasing an awkward passage, almost always improves it. You won't make it less true; you couldn't bear to. If a sentence sounds wrong, the idea is usually wrong too. Fix the sound, you tend to fix the idea.

## Why this matters

Plain prose keeps you honest. If you can't say something simply, suspect the idea. Fancy prose can conceal that there's nothing there. Plain prose also lasts; the culture and the language change, ordinary words don't.
