# Product steering

Cryptkeeper is a command-line tool for one job: decide which abandoned software projects are worth
reviving, and hand an agent a brief it can act on.

- Optimise for a single operator running it on a laptop against a folder of clones.
- The output is a decision, not a dashboard: every project gets a death score, a reason, and the
  smallest credible revival step.
- It never modifies the projects it scans. Reading only; the revive step is a separate, explicit action.
- No network calls in the scanner. Deterministic output for the same input, so a report can be diffed.
