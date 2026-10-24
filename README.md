# The Project Graveyard

**Every abandoned project has a story. Some deserve a second life.**

Frontend solution for **PS 05 — The Project Graveyard** | Code Variant — Build 01 (Round 2)

**Live demo:** _will be added after deployment_

## The problem

Most builders have unfinished projects sitting in old folders and repositories. They are rarely recorded, and the reason they stopped is forgotten. An unfinished project is not always a bad idea. This app gives those projects a place to exist and a clear way to decide what happens next. It is not a project-management tool.

## What you can do

- **Browse the graveyard:** every project is a tombstone card with name, language, last activity, reason it stopped and how complete it is. Search, filter by language or reason, and sort by recency or completion.
- **Record a project:** what it was, what you wanted to build, what you completed, what is unfinished, and why you stopped.
- **Read the autopsy:** findings for README, dependencies, open issues, tests and last activity. Each finding shows its source, and unknown data is marked Unknown instead of guessed.
- **Choose a revival path:** Restart, Continue, Change the idea, Repurpose or Archive. The suggested path comes with a reason based on completion and why the project stopped.
- **Generate a revival plan:** prioritized tasks (P1 to P3) with rough effort ranges. Accept tasks and mark them done to see progress.
- **Follow the timeline:** every action (path chosen, plan generated, task completed) is added to the project timeline.
- **Find co-revivers:** owners can mark a project as looking for help. It appears with its skills and open tasks.
- **Resurrection stories:** revived projects show their before-and-after timeline and live link.
- **Scan a public GitHub repo:** enter `owner/repo` to read its README, open issues, test files and last push date from the public GitHub API.

## What is real and what is not

- Data is stored in your browser (`localStorage`). There is no backend, login or database.
- The 6 starter projects are **sample data** and are labeled "Sample" in the app.
- The autopsy and revival plan are **rule-based**, not AI-generated. They use only the evidence available.
- GitHub scan uses the public API without a token, so private repos are not supported and rate limits apply. It does not scan dependencies, so that shows as Unknown for scanned repos.
- Collaboration is a visible listing only. Messaging or matching between users is not built.

## Tech stack

Plain HTML, CSS and JavaScript. No framework and no build step. Google Fonts (Fraunces, Hanken Grotesk). Canvas particles and CSS 3D for the hero. Deployed on GitHub Pages.

## Project structure

```
index.html       page structure
css/style.css    theme, layout, animations, responsive rules
js/app.js        data store, analysis (autopsy, paths, plan), views, GitHub scan, effects
```

`app.js` is split into labeled modules (store, helpers, analysis, views, GitHub scan, fx) so features can be changed without touching the rest.

## Run locally

Open `index.html` in a browser. No install needed.

## Design

Deep black and charcoal base, emerald green and antique gold accents, off-white text. Reduced-motion preference is respected and the layout is responsive down to mobile.

## Surprise Challenge

_To be filled after the challenge is released at 6 PM._

## Team

CODE HACKER

- [YOUR NAME] (GitHub: [your username])

## AI assistance

AI tools were used for coding assistance and design ideas. The team reviewed and takes responsibility for the code and content.
