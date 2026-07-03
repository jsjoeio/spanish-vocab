# algorithm

as a reminder, we're building a test for estimating your vocabulary size in spanish. for the first itereation, we're going to use a frequency list of lemmas that i generated locally using youtube videos about raising kids from mainly rioplatense speakers.

## things to keep in mind for implementation

for the first one, i'll give you the list of lemmas (large json file). read Astro.js docs to see what is the optimal way to work with large json in static sites (i feel like they have GET endpoints you can use? maybe we need that, maybe we don't. use your best judgement).

but in the future, i'd like to have a dropdown to select different "sources" e.g. test me based on this list, and dropdown would show a few different lists (e.g. rioplatense podcasts on parenting, software development, wikipedia, etc). so just keep that in mind.

also ideally in the algorithm, the functions we write are flexibile so they dont hardcode or assume our lemma list will always have X numbers. ideal number is 15k but some might be more or less, so we have to adapt based on that. BUT the test should always be a max 50 words, or less. that's only constraint.

one pager from Grok about frequency lists and lemmas.

Core Algorithm

Data Source
Use a frequency list of Spanish lemmas (base forms, not inflected forms like tengo/tienes/tenía → all map to "tener").
Sorted by frequency (most common first).
Target: at least 10,000–20,000 lemmas.

Band Sampling (Stratified)
Divide the frequency list into 10 equal bands (deciles):
Band 1: top 1,000 most frequent lemmas
Band 2: 1,001–2,000
...
Band 10: 9,001–10,000 (or higher)

From each band, randomly select 5 lemmas → total 50 words shown to the user.

Test Flow
Show one word at a time (or in small groups).
User clicks “I know this” only if they can recall the meaning (strict honesty instruction).
Record which words were known per band.

Scoring & Estimation
For each band, calculate % known = (known words in band / 5).
Estimate total vocabulary:textEstimated Vocab = Σ (band_size × %known_in_band)
Example: If user knows 100% of Band 1–4 (4,000 words) and 60% of Band 5–10, the estimate would be around 4,000 + 3,600 = 7,600 (simplified).
Add smoothing / confidence intervals if possible (e.g. ±10%).

Optional Enhancements
Show CEFR level mapping based on estimate.
Adaptive testing (stop early or add harder words).
Track user progress over time (optional login).


Why Lemmas?

Avoids inflating counts with conjugations and inflections.
Better represents real “word knowledge”.

Success Criteria

Test takes < 3 minutes.
Results feel accurate compared to existing tools (Lenguia, SpeakZy).
Easy to maintain and extend with new frequency data.


## dev preferences

ideally we can keep all the algorithm code in it's own file then export what's needed. add inline comments where things aren't obvious, and explain the why. keep short, concise, use lowercase.

for how you structure the code, lean on patterns from Grokking Functional Programming so think of things as:
- data
- side effects
- pure functions

i'll add the frequency list to the root as frequency.csv. but feel free to convert to json and move to another folder if needed.

after you're done, create a draft PR. and then ill test locally.