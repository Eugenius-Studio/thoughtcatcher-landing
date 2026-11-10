# Blurts content expansion

Implemented against website commit `bf46ffc` on November 9, 2026. Its homepage matched the published `blurts.app` HTML byte for byte before editing. The existing HTML/CSS/JavaScript architecture and GitHub Pages hosting are retained.

## Public content

- Seven comparison posts: Todoist, TickTick, Apple Reminders/Siri, Google Tasks/Gemini, Microsoft To Do, Notion, and Otter.
- Fourteen feature/account guides: voice capture, multilingual capture, live transcription, due dates and times, task organization, Lens, editing/completion, daily reminder, widgets, archive, Notion, Google Tasks, Microsoft Planner, and Apple sign-in.
- `/features/`, `/compare/`, `/use-cases/`, and an expanded `/blog/`.
- Shared desktop/mobile navigation and a four-column discovery footer on the homepage and all blog pages. Existing blog bodies remain intact.
- Unique titles/descriptions, canonical URLs, Open Graph/Twitter metadata, article/breadcrumb/FAQ structured data, internal related links, and sitemap entries.
- Genuine simulator screenshots with descriptive captions, alt text, intrinsic dimensions, and a full-size link. No generated or reconstructed app screens.

## Editing and rebuilding

New article text and comparison tables live in `content/seo/comparisons.json` and `content/seo/features.json`. The generated `.html` files are committed and served directly. There is no runtime JavaScript requirement for reading or discovering the content.

Run with Python 3.9 or later, using only the standard library:

```sh
python3 scripts/build-content.py
python3 scripts/check-content.py
```

The builder updates marked header/footer regions without replacing existing article bodies. It preserves existing sitemap URLs and updates modification dates only for the changed library and homepage paths. The validator checks headings, unique metadata, canonical URLs, structured data, image metadata, all internal links/assets/fragments, and sitemap coverage.

GitHub Pages currently publishes `main` from the repository root. The initial content expansion was merged in PR #4. Further changes use separate review branches; merging into `main` publishes through the existing Pages workflow.

## Homepage SEO update — November 10, 2026

- The homepage targets the descriptive category “voice to-do list app,” with the title `Voice To-Do List App – Turn Speech Into Tasks | Blurts` and matching description and Open Graph/Twitter text.
- The brand H1 remains “Say it messy. Get it back clean.” The supporting H2 is “A voice to-do list app for thoughts that won't wait.” The hero explains one recording becoming multiple tasks with dates and times when mentioned.
- The illustrative demo is labeled “Example recording” and expands into three tasks. It uses a native HTML disclosure, supports keyboard operation, and does not require JavaScript. It is not presented as a genuine app screenshot or a live extraction test.
- The homepage links directly to the Notion, Google Tasks, and Microsoft Planner guides and retains its iPhone/Android store links. No duplicate `/voice-to-do-app/` page was created.
- The homepage sitemap modification date is November 10; rebuilding preserves newer modification dates rather than reverting them to the original content-library date. The changed landing stylesheet has a content-hash URL to refresh cached styles.
- Validation: all 33 checked pages, 1,828 internal links/assets, and 36 sitemap URLs pass. Desktop (1280px) and mobile (390px) layouts have no horizontal page overflow. The demo opens and closes using the keyboard, metadata matches the rendered page, and no browser console errors were observed. Rebuilding is deterministic.

The category wording is an approved positioning choice, not a claim about measured keyword volume or future rankings.

## Evidence and claim boundaries

The mobile source reviewed was `thoughtCatcher-mobile` at `44821d39c900bab15ed3405086f090e7aa281b8e`, including its existing local feature-flag changes. Backend source was `thoughtCatcher` at `8bb4c149b62bf49ff7be63a61576c5d853c5438d`. Neither source checkout was edited. Detailed evidence, with repository-relative filenames and line numbers, is in `feature-evidence.json`.

The product owner confirmed Microsoft Planner and Lens are in production. Planner uses remote configuration; Lens appears when tasks exist. The owner explicitly requested that Insights and task breakdown remain unpublished drafts. Those drafts were delivered separately and are not included in the website's public content files or sitemap.

The feature inventory does not establish direct Apple Reminders, Apple Calendar, Google Calendar-event, Microsoft To Do, or Apple Watch support. It also does not establish typed-new-task capture, recurring task generation, per-task due-time alarms, fully offline extraction, or general two-way synchronization. These claims are not introduced by the new guides. The homepage's unverified integration claims and individual-reminder demo label were corrected. The owner identified Settings > Apple as the Reminders entry point; tracing that exact control showed Sign in with Apple (name/email identity scopes and account linking), not a Reminders connection. The new Apple sign-in guide documents the actual flow. Apple Reminders task delivery remains unverified; an earlier owner-confirmation-only addition was removed after inspecting the identified control.

Planner creates delivered tasks; later Blurts edits, completion, and deletion are not claimed to update Planner. Notion/Google changes can be sent from Blurts, but reverse synchronization is not promised. Google Tasks inside Calendar is distinguished from creating Calendar events. Planner is presented as a paid integration, not a free-tier destination.

Competitor claims use official sources reviewed on November 9, 2026. Todoist Ramble, TickTick AI Voice Add, Gemini task capture, and Notion/Otter action extraction are acknowledged. No comparative accuracy benchmark, speed result, testimonial, or exact competitor price was invented.

## Screenshot and verification limits

The connected iPhone 17 Pro simulator showed Notion connected to Main Tasks and Microsoft Planner configured with a plan and bucket. Opening the Planner destination picker showed **Reconnect required**. The article shows that real state; successful delivery is not inferred from a connected badge. The product owner subsequently confirmed successful Notion delivery and supplied a screenshot of the actual destination showing the matching demo tasks with Captured status. That screenshot is now included in the Notion guide. Notion task creation is confirmed by this user-supplied evidence; subsequent edit/deletion propagation and other field mappings remain untested. Planner delivery remains untested.

The owner added non-sensitive demo tasks. The resulting task list, Lens, and task editor were captured without changing those tasks. A screenshot-only recording was discarded without submission. The separate Notion destination screenshot is user-supplied, not a simulator capture. Screen captures are unaltered; their hashes and provenance are in `screenshot-provenance.json`.

No connected Google Tasks account or widget setup was available for a genuine demonstration screenshot. Live transcription is intentionally disabled in the iOS simulator. Those guides describe verified code behavior without fabricated visual proof. The archive and daily reminder guides similarly avoid manufactured populated screens or notifications.

The Apple sign-in guide shows the genuine settings entry point; Apple authorization and account recovery were not exercised.

The local checks cover rendered content and links, not search-engine indexing or rich-result eligibility. Existing robots rules still permit Googlebot and Bingbot and block unspecified crawlers. Existing pricing amounts and billing/cancellation promises were not independently audited against live store offers.

## Validation

- Static validator: 33 pages, 1,825 internal links/assets, 36 sitemap URLs; zero errors.
- Browser checks: eight representative routes at 390px and 1280px; one H1, shared navigation/footer, and no horizontal page overflow in all 16 checks.
- Additional Apple guide checks: desktop/mobile article layout, table-of-contents navigation, and mobile account-section placement pass; Apple sign-in is excluded from the task-integrations section.
- Visual review: desktop/mobile index, comparison article, integration screenshot, existing homepage, and discovery footer. Menu and table-of-contents navigation verified; no browser console errors observed.
- External citations: 20 of 22 official URLs returned HTTP 200 to the link check. Otter Help and the Microsoft product page rejected the automated HTTP client with 403, but both were successfully retrieved through web browsing; no missing source was found.
- `git diff --check` passed. Rebuilding with unchanged inputs is checked for deterministic output.
