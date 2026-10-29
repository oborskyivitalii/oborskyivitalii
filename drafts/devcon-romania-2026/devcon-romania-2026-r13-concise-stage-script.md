# DevCon Romania 2026 — Concise Stage Script R13

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · 4 November 2026

Concise English stage script, revised from R12. Only the spoken sections for Slides 02, 08 and 09 have changed. Only Slides 01–09 are spoken. Delivery notes and references follow separately. The presentation has not been changed.

## Slide 01 — Two problems

Good afternoon. I am Vitalii. My career spans embedded systems integration, testing and project management. Today I lead PMO and delivery. I built their foundations in my company from scratch.

I also stay hands-on with AI. I believe its impact could be comparable to writing and printing. Writing moved memory outside our heads. Ideas could outlive their authors and change institutions.

Now we delegate parts of thinking: interpretation, planning and choice. I do not mean consciousness.

Such a shift requires clear problem statements. Market narratives can obscure them: first developers will disappear; then code review is the bottleneck to remove.

I see two problems.

First, AI can unbalance the SDLC. Adoption means rebalancing the system.

Second, delegating decisions inside a product requires a control architecture. Complex, high-impact systems may need R&D and a socio-technical design before we can promise delivery.

In both cases, what must we remain able to understand and control?

## Slide 02 — The whole delivery system

Let's use the theory of constraints.

Imagine each delivery step handles eight comparable tasks a month. Now coding produces one hundred. Review still handles eight. If we admit everything, ninety-two tasks wait.

To use the extra capacity, we must examine downstream steps, including operations, and upstream intent and design. This can involve the whole business, including marketing and sales. We can also limit incoming work. We do not have to use every unit of generation capacity.

Suppose we rebalance everything. Beyond operations is the user.

Someone opens our app twice a month. They can absorb eight changes. One hundred visible changes may overwhelm them, even if each is useful. Faster delivery could reduce retention and revenue.

We can release changes gradually. But the point remains: the system includes the user's ability to absorb them.

These steps also exchange knowledge, feedback and artifacts. Overload affects those connections too.

If that imbalance remains, overloaded downstream teams can miss errors and pass them on. Both the SDLC and its product can deteriorate: team burnout, less reliable delivery, poorer product quality and stability.

So, a supposedly safe AI rollout for a mid-sized or larger engineering organization: buy licenses, add a little training. What could possibly go wrong? The system-level problem was never recognized, named or assigned an owner.

## Slide 03 — The evidence

These reports examine different populations and outcomes. They do not form one pipeline, and not all are independent of vendors.

NBER studied over half a million developers. Estimated commits reached about three point four times baseline; releases, one point three. Samples and tool coverage differ. Marketplace supply grew without a matching increase in overall usage. More code alone does not establish more user value.

Chen and Stratton studied 718 firms. Pull requests per active worker-month rose about 23 percent after agent adoption. Submission-to-merge time rose about 49 percent. That includes waiting.

Agarwal and colleagues studied 1,197 repositories, including controls. Code complexity increased. Warnings increased significantly in the agent-first group, but not the IDE-first group.

DORA links AI adoption with higher throughput and greater instability. It is a survey, not proof of causality.

GitClear analyzed 623 million changes. It reports fewer refactoring-related line moves and more duplicated blocks. These are quality signals, not proof that AI caused defects.

My conclusion: assess the whole delivery system, beyond coding activity.

## Slide 04 — Review and ownership

Review has two functions: a quality gate and a way for the team to understand the system.

Remove either without a replacement, and local speed can create future costs.

Understanding supports ownership: the ability and authority to change, diagnose and recover the system. Responsibility remains even when that ability weakens.

One experiment involved 69 participants, including fourteen professional developers. With AI, they completed more work but answered fewer questions correctly about their code. It measured short individual tasks, not whole-team ownership.

AI can also help people learn. We must check what our process actually does.

Imagine buying licenses and courses for a thousand engineers. That does not establish whether delivery can absorb more work.

Queues can grow. Review pressure can rise. Weaker gates can let more defects and debt reach production.

That creates a risk of technical default: responsibility for a system we can no longer maintain or recover at an acceptable cost. It is a risk to investigate, not a proven outcome for every organization.

## Slide 05 — Finding a new balance

AI adoption changes the system that earns your revenue. Licenses and courses are only inputs.

Across experiments, watch code quality, queues and recovery. Limit incoming work. Compare useful outcomes and full cost with a baseline.

Review agents may help. But generator and reviewer can share blind spots. And who learns how the system changed?

Generated documentation may help too. But a clear explanation can describe a poor decision. Who checks it against code, tests and actual behavior?

Even accurate documentation does not guarantee that the team can use it during an incident.

Disposable code also has limits: data, integrations and obligations can outlive an implementation.

Experiment, but preserve a recovery path when agents fail or become unavailable. Responsibility remains with us.

We may find different operating models rather than one universal AI-native SDLC. Domain, legacy, team, risk and cost will shape AI's role at each step.

## Slide 06 — Decisions inside the product

Now the product itself. An LLM can choose a path to the user's goal at runtime.

For a deterministic component, the same inputs, state and version give the same result. With a model, we often consider a range of possible outputs. Each run reveals one outcome.

Traditional software also has uncertainty. Here, we delegate more decisions inside the application.

Requirements must describe acceptable outcomes and boundaries. For an account-recovery assistant: useful advice, recoverable mistakes, prohibited disclosures and actions requiring authorization.

A bug can be a plausible answer outside those boundaries. Testing needs repeated samples and interpretation of failures. One success proves little about reliability. One serious failure can block release.

Readiness may mean being ready for a feasibility study, not a full feature. Completing an increment and approving its operating scope are separate decisions.

For DevOps and SRE, availability is not enough. We must observe whether the system produces acceptable outcomes. Provider updates and changing context can alter behavior without a code change.

I call these thinking systems because we delegate cognitive work to them. They create new opportunities and new operating demands.

## Slide 07 — The hypothesis stays alive

Imagine two hundred test responses: 196 acceptable, three wrong instructions and one privacy leak.

The score is 98 percent. But that disclosure is unacceptable in this project. We must redesign the affected path. The average cannot make that decision for us.

Suppose we fix it and release within an agreed scope. Users, context or the model can still change. Yesterday's evidence may no longer describe today's behavior.

Our claim that the system works remains a hypothesis in production.

Shadow operation and canaries can provide evidence where exposure is acceptable. They cannot replace preventive controls. Rollback cannot undo a disclosure.

We need monitoring and the authority to intervene for as long as people use the system.

## Slide 08 — The control system

Design the control architecture while framing the project. A diagram cannot guarantee reliability. We need evidence that the controls work.

Enforce sensitive data access and account permissions outside the model. Check text output too: a disclosure needs no tool call.

The loop needs evidence, interpretation, decision authority and timely action. Then verify that the intervention worked.

Include models, monitoring, human review and recovery in the cost. If the whole system is not viable, reduce scope or fund more R&D. Complex cases may need a control engineer or mathematician. Sometimes we should not proceed.

Where automation is insufficient, a trained human may be the best available control. Their skills, workload, information and authority become architectural dependencies. This is a socio-technical system.

For DevOps and SRE, monitor that human control at runtime. Beyond availability, track qualified coverage, queues, workload and response time. Check whether people have the information and authority to act, and whether interventions work. Fatigue is harder to measure directly; workload can signal strain.

If capacity falls, reduce autonomy, use a tested fallback or pause.

An operator can be online while their control is already failing.

For teams building their first agentic applications, a successful demo alone does not justify funding full development. We also need to understand the control architecture. This can reveal a different risk landscape, identify missing expertise and improve the budget forecast. The project's direction can change before the development budget is committed.

## Slide 09 — Closing

You may recognize this: AI spending rises, more code appears, but the business result is unclear. Or the demo works, but nobody knows who will intervene in production, how quickly, and at what cost.

These are the problems I research. Both repositories use systems thinking: examining the whole system and its relationships.

The Subprime Code Crisis looks at SDLC imbalance through the theory of constraints. It is an early research repository, still a little rough. If these or other problems with AI adoption affect your teams, I'd be glad to discuss them with you.

Uncertainty Architecture looks at thinking systems through control theory. This repository explores the control problem we discussed. If you have faced it, I'd be glad to hear about your experience too.

Both projects are public and developing. The QR code leads to my website, articles and contact details.

Come and talk to me afterwards.

Let's build the future. But keep asking: what if not? How will we know, and can we still act?

Thank you.

---

## Delivery notes — not spoken

Обсяг сценічного тексту: 1 552 слова за автоматичним підрахунком. R12 мала 1 405 слів; приріст у R13 — 147 слів (10.5%). Числа й абревіатури при вимові можуть трохи збільшити тривалість.

| Темп чистого мовлення | Без додаткових пауз | Із запасом 2–3 хв на паузи, схеми та перемикання |
| --- | --- | --- |
| 80 слів/хв | 19:24 | 21:24–22:24 |
| 90 слів/хв | 17:15 | 19:15–20:15 |
| 100 слів/хв | 15:31 | 17:31–18:31 |
| 110 слів/хв | 14:07 | 16:07–17:07 |
| 120 слів/хв | 12:56 | 14:56–15:56 |

Це сценарії розрахунку, не результат репетиції. Якщо вимірюєш загальний темп запису разом із паузами, не додавай ті самі паузи вдруге. Бюджет 20–22 хв — верхня межа, яку не потрібно заповнювати словами заради тривалості.

Для першої репетиції говори природно, без намагання досягти конкретної цифри. Орієнтир для планування цієї технічної доповіді — приблизно 100–120 слів/хв; особистий темп треба виміряти. Trent University пропонує 100–120 слів/хв для формального виступу, University of Kent — 100–130 для виступу за сценарієм. Це практичні орієнтири, не універсальні межі зрозумілості.

- [Trent University: Delivering an Oral Presentation](https://www.trentu.ca/academicskills/how-guides/how-present-university-and-beyond/delivering-oral-presentation-public-speaking)
- [University of Kent: Giving an Oral Presentation](https://student.kent.ac.uk/studies/giving-an-oral-presentation)

Читай повністю вголос, з реальними паузами та перемиканням слайдів. Не оцінюй час читанням подумки. Якщо виходить 16–18 хвилин, це нормальний результат: не додавай назад повтори лише для заповнення слоту.

У фрагменті для слайду 2 скажи «What could possibly go wrong?» з легкою іронією та короткою паузою. Не прискорюй фінал для слайду 8: це висновок про рішення до фінансування повної розробки. На слайді 3 називай лише цифри зі спічу. Решта чисел залишається референсами для слухачів. На слайді 6 покажи формули, але не читай їх як математичну лекцію. У фрагменті для слайду 8 дай паузу після «architectural dependencies», «An operator can be online while their control is already failing» та фінального речення. У фіналі зроби паузу після «the business result is unclear».

Дуже короткі речення не слід вимовляти однаковим уривчастим ритмом: з'єднуй речення одного абзацу природною інтонацією. Мета — проста мова і час на розуміння.

## Sources — not spoken

All six research references are retained. The existing slides have not been edited. Detailed research caveats remain in R11; this short script keeps the qualifications needed to avoid misleading spoken claims.

- [NBER: Writing Code vs. Shipping Code](https://www.nber.org/papers/w35275). Different samples and tool coverage; activity, releases and marketplace use are different outcomes. The 25.5× changed-LOC figure on the existing slide is not spoken and must not be described as developer speed.
- [Chen and Stratton: Artificial Intelligence in the Firm](https://fion.ac/jellyfish.pdf). 718 firms; PRs per active worker-month; elapsed submission-to-merge time includes waiting.
- [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2). 1,197 repositories includes treated and matched controls; warnings are significant only for the agent-first group in Table 2. Complexity and warnings are proxies.
- [DORA 2025](https://dora.dev/research/2025/dora-report/). Google Cloud program; survey associations, not causal proof. The existing slide gives 4,867 respondents.
- [GitClear: The Maintainability Gap](https://gitkraken.gitclear.com/the_ai_code_quality_maintainability_gap). Vendor analysis of 623 million code changes; structural signals do not isolate AI causality.
- [Martin-Lopez and colleagues: More Code, Less Understanding?](https://personal.us.es/amarlop/wp-content/uploads/2026/03/More-Code-Less-Understanding-On-the-Impact-of-AI-Assistants-on-Developers-Productivity-and-Code-Ownership.pdf). 69 participants, 14 professionals; short individual tasks, not whole-team production ownership.

## Що змінено в R13 — не для сцени

Точкове оновлення англійського спічу R12 за авторськими правками. Самі слайди, PPTX та PDF не змінювалися.

- **Slide 02:** фінал пов'язує перевантаження наступних етапів із пропущеними помилками, вигоранням, менш надійним delivery та погіршенням якості й стабільності продукту. Додано іронічний висновок про ліцензії, мінімальне навчання та системну проблему без власника. Це можливий сценарій, а не твердження про неминучий наслідок будь-якої AI-адопції.
- **Slide 08:** додано висновок про контрольну архітектуру, іншу карту ризиків, потрібну експертизу й прогноз бюджету до фінансування повної розробки. Вдале демо саме по собі не обґрунтовує такий бюджет; можливість feasibility та R&D збережена в основному тексті.
- **Slide 09:** окремі запрошення до розмови для Subprime та Uncertainty Architecture; збережено systems thinking, theory of constraints, control theory, QR на сайт і завершальне «What if not?».

Усі інші сценічні секції та шість дослідницьких джерел збережено. Оновлено лише службові відомості про версію, обсяг, розрахунковий час і ці зміни. Тривалість треба перевірити реальною репетицією.
