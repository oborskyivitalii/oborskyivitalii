# Cloudflare staging: перевірка плагіна — 5 жовтня 2026

Нова вказівка дозволяє перевірити Cloudflare та підготувати конфігурацію staging.
Створено окремий **`oborskyi-author-ci-staging`** Direct Upload проєкт. API
повернув project ID `d4b9b7b2-8ee6-4762-b9b1-84e221db9fbb`, `source:null`,
production branch `production-disabled`, вимкнену Web Analytics injection,
порожні latest/canonical deployments та **0 деплоїв**. GET після POST підтвердив
потрібні налаштування. Жодних асетів цим виконанням не завантажено.

Спочатку `oborskyi-site-staging` був порожнім Direct Upload проєктом; його
production/analytics settings підтверджено idempotent PATCH і повторним GET.
Під час наступного контрольного читання він уже мав GitHub source, production
branch `main`, автоматичні production/preview deployments і два успішні provider
deployments. Ці зміни відбулися поза цим виконанням. Один preview вказує SHA
`5020f05f3764b2a3141514795960a8dd98764165`, production — старий main
`2ebdd731d5dcf1e12f43f60dd0b3a6ec49b94684`. Його не перезаписували і не видаляли;
новий CI-проєкт ізольований, бо `projectPolicy()` відхиляє Git source/main branch.

## Що доступно зараз

| Дія | Перевірений стан |
| --- | --- |
| Читання акаунта, Pages-проєктів і deployments | Працює: є один підключений акаунт; до створення CI-проєкту був один Pages-проєкт. |
| Редагування Pages | Працює: PATCH і контрольний GET успішні. Потрібну конфігурацію підтверджено. |
| Створення Pages-проєкту | Працює: POST створив `oborskyi-author-ci-staging`, контрольні GET підтвердили конфігурацію і 0 deployments. |
| Завантаження deployments | Ендпоїнт є в API-плагіні, але цим виконанням upload не виконувався. Він має пройти через підготовлений trusted workflow. |
| Керування API-токенами | Не доступне цим підключенням: GET account token permission groups відхилено з кодом **9109 Unauthorized**. Не створювали й не експортували секрети. |
| GitHub Environment, secrets, variables і branch protection | У встановленого GitHub connector немає цих операцій запису. Секретні endpoint families не підтримуються. Потрібна дія власника в Settings. |
| DNS/custom domain/SSL | Для початкового Pages preview не потрібні. Не перевіряли права та не змінювали зони чи DNS. |

Доступ до Pages через чат не передається автоматично GitHub Actions. Там потрібен
окремий deployment token. API-плагін може виконувати provider operations, але
ручний upload ним обійшов би прив'язку артефактів, повні перевірки та recovery.
Цей шлях не використовується для прийняття staging.

## Що зробити власнику

1. Cloudflare dashboard → потрібний акаунт → API Tokens → Create Token → Custom
   Token. Додайте **Account → Cloudflare Pages → Edit**, обмежте цим акаунтом.
   Перенесіть значення одразу до GitHub Environment secret нижче.
2. [GitHub Environments](https://github.com/oborskyivitalii/oborskyivitalii/settings/environments)
   → `staging`. Додайте environment secret `CLOUDFLARE_API_TOKEN`. Додайте
   environment variables: `CLOUDFLARE_ACCOUNT_ID` — 32-символьний ID підключеного
   акаунта, `CLOUDFLARE_PAGES_PROJECT=oborskyi-author-ci-staging`,
   `SITE_STAGING_CREATE_PROJECT=false`. ID акаунта надано власнику окремо;
   Pages project UUID вище не є ID акаунта. Наявність/значення GitHub secrets не
   читали; якщо вони вже налаштовані, перевірте точні назви та Environment.
3. В Environment виберіть deployment branch **`main`**, а не All branches чи
   історичний PR-10 merge ref. Додайте owner reviewer, якщо це підтримує план.
   Для єдиного reviewer залиште можливість підтвердити власний запуск.
4. [GitHub Branches](https://github.com/oborskyivitalii/oborskyivitalii/settings/branches)
   → branch protection для `main`: pull request перед merge, актуальні required
   checks **`checks`** та **`Local navigation and RI freshness`**, up-to-date branch.
   Перевірений поточний `main` — `2ebdd731d5dcf1e12f43f60dd0b3a6ec49b94684`,
   `protected:false`. Захист Environment не заміняє branch protection.
5. Repository Actions variable `SITE_STAGING_ENABLED` лишіть false/відсутнім.
   Обидва false guards також лишаються. Виправлення P1/V1 поки Draft: холодний
   Writing має вікно **89,2 мс за ліміту 80 мс**.

Після прийняття поточного source та його інтеграції у захищений main окремий
reviewed change прибирає pause guards. Тоді manual **Actions → Site basic checks
→ Run workflow → main** з повним поточним tip SHA запускає immutable candidate,
повний staging profile й promotion однакових bytes лише після успіху. Послідовність,
точні ідентичності та schema-2 recovery описані в [SITE-STAGING](../../SITE-STAGING.md).

## URL та незавершені критерії

`oborskyi-author-ci-staging.pages.dev` — виділений subdomain нового CI-проєкту.
`https://staging.oborskyi-author-ci-staging.pages.dev` — **планований** stable preview
alias після успішного promotion, не перевірений живий сайт. Immutable URL має
повернути реальний deployment. Поки немає hosted full evidence, 404/noindex/
served-byte acceptance або продемонстрованого recovery; #8 і #13 відкриті.
Color лишається offline comparison, поки його окремо не вибрано для deployment.

Зовнішній deployment попереднього проєкту має provider status success та URL
[oborskyi-site-staging.pages.dev](https://oborskyi-site-staging.pages.dev/), preview
[21948511.oborskyi-site-staging.pages.dev](https://21948511.oborskyi-site-staging.pages.dev/).
Web retrieval цих URL був недоступний, тому їхні HTTP/bytes/headers не перевірені
і вони не замінюють full hosted gate. Production у термінах цього Pages-проєкту
не означає, що GitHub Pages production-реліз сайту виконано.

Перевірено через Cloudflare API та офіційні документи:
[Pages CI/token setup](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/),
[project update API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/edit/),
[preview aliases](https://developers.cloudflare.com/pages/configuration/preview-deployments/),
[GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
Account plan/quota beyond the returned project count was not inspected; a quota
or permission failure must stop upload rather than trigger a purchase.
