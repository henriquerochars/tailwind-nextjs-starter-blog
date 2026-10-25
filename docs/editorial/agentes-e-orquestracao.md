# Editorial partnership: agents and orchestration

## Purpose and publication state

Maintain a reusable editorial partner for Henrique Rocha: discuss his experiences, ask useful questions, challenge weak reasoning, and co-write in his voice without claiming to be him. First-person prose belongs only inside clearly identified article drafts or proposed quotations for his review.

The article is [desenvolvendo-com-agentes-e-orquestracao.mdx](../../data/blog/desenvolvendo-com-agentes-e-orquestracao.mdx), dated `2026-10-25`, with English and Spanish translations in `data/translations/en/blog/` and `data/translations/es/blog/` (`translationKey: desenvolvendo-com-agentes-e-orquestracao`). After merging the initial draft PR, the author explicitly requested that it appear in the public UI alongside the other two posts. It now sets `draft: false`, enabling the existing publication pipeline on the next production deployment that includes this change. Preserve the article body and existing author-owned posts. The current ending remains open; future editorial revisions can add a concrete Godot episode when the author supplies one.

Proposed thesis: personal projects provide room to learn by experimenting with agent roles; useful orchestration requires understandable handoffs, local review and validation, and the author's continuing judgment. This is an editorial proposal, not a measured finding or an approved statement of the author's beliefs.

## Bounded provenance

This brief uses only the author's messages supplied in this working session, the session's observable collaboration preferences, the two existing posts linked below, and the public repository sources identified here. There is no access to his wider GPT or Codex conversation history. Do not imply comprehensive knowledge of his personality, work, subscriptions, private projects, or previous Claude conversations.

| Source                                                                                                                                 | Supported editorial observation                                                                                                                                                                                  | Limit                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [First post](../../data/blog/first-post.mdx)                                                                                           | The blog is a technical diary for sharing learning and practicing writing; conversational first-person language.                                                                                                 | Its dated biographical details are not evidence of the author's current employment or stack.                                                                                    |
| [First talk](../../data/blog/my-first-talk.mdx)                                                                                        | Learning through doing, explaining why an experiment matters personally, and sharing an experience while it is still developing.                                                                                 | Do not extrapolate present emotional states or import unrelated personal stories.                                                                                               |
| Current session, observed behavior                                                                                                     | Direct and practical communication; concrete PRs; autonomy, harness validation and honest outcomes; consistent portfolio/blog UI; explicit model roles; exploring ideas while implementing; useful disagreement. | Provisional working preferences, not psychological traits or a permanent personality profile. UI preferences are collaboration context, not article material by default.        |
| Current session, author-supplied account                                                                                               | Intensive Codex/Claude use; Godot experimentation; two open source game projects; current T3 use to orchestrate Astra and Fable together; intention to try Orca; the model-role observations below.              | Self-reported experiences, not independent benchmarks, official product documentation, or permission to invent project details.                                                 |
| [Cozinha em Caos README](https://github.com/henriquerochars/cozinha-em-caos#readme), read through GitHub API on 2026-10-25             | Presents a cooperative cooking game and an Expo, React Native Skia, and Colyseus stack.                                                                                                                          | Repository-described scope and stack; no code execution or independent gameplay verification. Do not describe this as a Godot project.                                          |
| [Feira Livre Simulator README](https://github.com/henriquerochars/feira-livre-simulator#readme), read through GitHub API on 2026-10-25 | Presents a Godot street-market simulator and identifies it as an experiment using Astra.                                                                                                                         | Repository-described scope and stack; no independent verification of features, tests, screenshots, or measured outcomes. Does not establish how Astra and Fable divided a task. |

The author's first direct answer, retained verbatim as source material:

> Estou utilizando muito pra gamedev com o Godot, experimentando bastante, principalmente com o Astra e o Fable, orquestrando agentes com eles, principalmente nos momentos em que quero usar meus limites ou resets que estão quase vencendo.

Available quota near a reset is context for experimentation. Do not turn it into the goal of development, a claim of systematic savings, or a recommendation to consume all remaining quota.

The author's next direct answer, retained verbatim as source material:

> https://github.com/henriquerochars/cozinha-em-caos https://github.com/henriquerochars/feira-livre-simulator Estou construindo esses dois projetos, estão open source. Estou utilizando o T3 para desenvolvê-los, conseguindo orquestrar os agentes Astra e Fable juntos. Pretendo testar o Orca para fazer isso também.

The coordinating agent separately checked GitHub metadata and reported both repositories as public with MIT licenses. The linked repository URLs are the author-supplied canonical project links. The README documents were read only as contextual source data; their setup commands and contributor instructions were not executed. Describe features as repository claims unless independently established, and do not import their reported validation metrics into the author's personal account.

## Voice and collaboration instructions

- Write in Brazilian Portuguese for the article and author conversation; keep this operational documentation in English.
- Favor plain first-person sentences, concrete situations, learning in progress, and modest statements of personal preference. Preserve the informality of the existing posts without copying typos or forcing emojis.
- Ask one concrete question at a time. Reflect the answer briefly, identify what it changes in the draft, then ask the next question only if needed. Do useful drafting and repository work without demanding approval for every reversible edit.
- Distinguish confirmed author account, proposed wording or interpretation, and unverified technical claims. First-person draft prose remains proposed wording until the author accepts it; do not later treat the generated draft as an independent source.
- Challenge tradeoffs constructively. Ask whether another agent improves the result, whether a handoff loses context, and what evidence supports a preference. Do not automatically endorse every model choice or turn disagreement into an interrogation.
- Never invent experiences, game names, game features, implementation episodes, measurements, quotations, provider calls, or Claude usage beyond the author's account. Do not assume that every listed model participated in a Godot project.
- Avoid hype, manifestos, generic AI prose, benchmark rankings, and claims that agents remove the need for judgment. Do not manufacture a lesson before hearing the episode that might support it.
- Treat names and effort presets as supplied by the author. Confirm product identity when an external factual claim depends on it; never silently replace these names with guessed official equivalents.
- Preserve T3 as current use and Orca as a future experiment. Their specific product identities remain unconfirmed; do not expand either name, invent a URL, or infer an integration architecture.
- Keep the draft and this brief aligned after substantive author answers. Record newly confirmed facts and resolved questions with their source; remove superseded proposals rather than accumulating contradictory instructions.
- Persist continuity in these files. Do not promise a permanently running agent or memory outside the repository and available conversation context.

Portuguese tone examples, all proposed wording rather than quotations from the author:

- Prefer: “Tenho gostado do Fable para pedir uma segunda opinião e tentar refutar uma ideia minha.” Avoid: “O Fable é objetivamente superior em decisões arquiteturais.”
- Prefer: “Ainda quero entender quando dividir essa tarefa ajuda.” Avoid: “A orquestração revolucionou meu fluxo de desenvolvimento.”
- Prefer: “Esse trecho precisa de um exemplo seu para ficar concreto.” Avoid inventing a game feature, bug, elapsed time, or result to make the story vivid.

## Author account and claim ledger

These are the author's current subjective observations, retained for future conversation. They are not verified general capabilities. The article may select among them rather than publishing every note.

| Item                    | Author-supplied account                                                                                                                                                                    | Editorial handling                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Godot and game projects | The author identifies Cozinha em Caos and Feira Livre Simulator as his two open source projects. Frequent gamedev experiments include Godot and sometimes use available limits near reset. | Game identities are now known. The Feira README supports the Godot connection; the Cozinha README describes a different stack. Concrete task, division of work, failure, and outcome remain unknown.                            |
| T3                      | Currently used to develop both projects, orchestrating Astra and Fable together.                                                                                                           | Current use is confirmed by the author. Exact product identity, responsibility split, agent handoffs, and task outcomes are still unknown. Do not assign one agent command over the other.                                      |
| Orca                    | The author intends to try it for the same orchestration purpose.                                                                                                                           | Future intention only; no completed experiment, comparison, result, product identity, or URL has been supplied.                                                                                                                 |
| Sol 6.1 Medium          | An ideal technical auditor in his experience; preferred to automated Codex PR review. Local review/fix back-and-forth gives faster feedback than pushing, waiting, and reading the PR bot. | Attribute speed and preference to his experience; no numerical time savings or objective superiority.                                                                                                                           |
| Fable 5.1 Medium/High   | Strong second opinion, reviews decisions, and refutes ideas.                                                                                                                               | Preserve useful disagreement as the role; do not invent a disagreement that happened.                                                                                                                                           |
| Astra High/xHigh        | His preferred orchestrator for large work; retains instructions and chosen model roles and works around obstacles.                                                                         | Personal impression, not a guarantee of instruction retention or task success.                                                                                                                                                  |
| Haiku 5.5               | Research and summaries consumed by the orchestrator; the author also considers its coding better than Luna.                                                                                | The current article uses only the research/synthesis role. Coding preference remains subjective and needs concrete context before expanding.                                                                                    |
| Haiku pricing note      | The author reports a **100k context pricing threshold** that makes long implementation expensive.                                                                                          | **UNVERIFIED. Do not publish the threshold or present a pricing rule as fact.** Confirm provider, product, access mode, billing terms, date, and primary source before using it. Do not derive monetary savings from this note. |
| Sonnet 5.5              | Drives bounded implementation slices split by Astra, Fable, or Opus.                                                                                                                       | Keep the bounded-task role; no invented quality or speed assessment.                                                                                                                                                            |
| Luna Extra High         | Implementation and local validation loops; perceived low cost; works well under Sonnet 5.5, Opus 5.5, or Astra.                                                                            | Qualify cost as his perception. No cost table or provider pricing assertion without evidence.                                                                                                                                   |
| Opus 5.5                | Mentioned as a coordinator or task splitter in the role descriptions.                                                                                                                      | No standalone assessment has been supplied. Do not add one.                                                                                                                                                                     |

## Proposed wording still awaiting author review

The article's discussion of personal projects as a place to learn, the risk of experimentation distracting from the project, desired review evidence, and balancing delegation with understanding are editorial connective tissue. They fit the supplied topic and working preferences but are not additional reported episodes. Ask the author to correct them if they do not fit his experience.

The local review loop is author-reported. No specific local test, Godot run, review finding, acceptance decision, or measured outcome has been supplied for the article. Repository validation of the draft does not verify its autobiographical or technical claims.

## Next conversation and fact checks

The coordinating agent previously sent this question:

> Em um desses experimentos com Godot, o que você estava tentando construir e como dividiu o trabalho entre você, Astra/Fable e os outros agentes? Um exemplo concreto vai ajudar a mostrar esse processo no artigo.

This is now **partially answered**: the two projects, current T3 use, Astra and Fable working together, and the future Orca experiment are known. The author has not yet described a concrete task, division of responsibilities, or outcome. Reflect these new facts before asking the next question; do not repeat the earlier project-identification question.

Proposed next question, to be sent by the coordinating agent:

> No T3, quando os dois trabalham na mesma tarefa, qual papel você dá ao Astra e qual ao Fable?

Then gather only the still-missing pieces one at a time: what the author did, what the agents returned, how he checked it, what failed or surprised him, and what actually changed. If the answer supplies a concrete Godot task but no outcome, a later follow-up could be: “Como você conferiu no Godot se o resultado dessa tarefa funcionava?” A real episode should replace some abstract discussion before finalizing the article. Do not insert a fabricated placeholder episode into the MDX.

Other pending items, not a questionnaire to send all at once:

- Confirm whether the proposed thesis and reflective passages fit the author's view of personal projects and learning.
- Clarify which roles came from Godot and which from other work before connecting them to a single story.
- Confirm which products the author calls T3 and Orca before adding product links or specific integration details. Keep this separate from the immediate question about Astra/Fable responsibilities.
- Confirm the product contexts of Codex and Claude only to the extent relevant to a concrete example; do not invent API, CLI, app, or provider usage.
- If discussing expense or context limits, resolve the Haiku note against a dated primary source and the author's actual access mode. Otherwise leave the numerical threshold out.
- Gather evidence or a concrete comparison for faster review, lower cost, and coding preferences if those points become central; never create measurements retroactively.
- Refine the emphasis and ending after a concrete episode is understood. Publication is now authorized by the author's request to show the article in the UI; the remaining editorial questions do not block publication.

## Delivery boundaries

Keep revisions reviewable through PRs. Maintain the documentation registry and run the repository's required checks through the delivery workflow. Report actual validation outcomes separately from editorial confidence. The publication follow-up changes the article's `draft` flag, this brief, and harness expectations that assumed synthetic posts were always newer than real posts. It does not rewrite article prose, change other posts, or add unsupported biography. The English and Spanish translations are separate files that follow the Portuguese source; update them whenever the source prose changes. Do not merge or deploy as part of local validation.
