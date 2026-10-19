'use strict';
// Bounded current-index observations share the existing Chromium preview job.
const assert = require('node:assert/strict');
const api = require('../../site/engine/article-tags.cjs')();
async function journey(browser, baseURL, index, descriptors) {
  api.validate(index);
  const base = new URL(baseURL.replace(/\/$/, '') + '/');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const ready = () =>
    page.waitForFunction(() => document.body.dataset.tagsState === 'ready', null, {
      timeout: 10000,
    });
  const observations = {};
  try {
    await page.goto(new URL('writing.html', base).href);
    await page.waitForFunction(
      () =>
        !document.getElementById('site-content')?.hasAttribute('aria-busy') &&
        document.querySelector('.space-scene')?.dataset.ready === 'true' &&
        document.querySelector('.space-scene')?.dataset.travel === 'settled',
      null,
      { timeout: 10000 }
    );
    await ready();
    assert.equal(
      await page.locator('li.publication .publication-tags').count(),
      index.articles.length
    );
    const tag = Object.keys(index.vocabulary).find((tag) => {
      const count = index.articles.filter((article) => article.tags.includes(tag)).length;
      return count > 0 && count < index.articles.length;
    });
    assert.ok(tag);
    const chip = page
      .locator('li.publication .publication-tags a')
      .filter({ hasText: index.vocabulary[tag] })
      .first();
    await chip.scrollIntoViewIfNeeded();
    await chip.click();
    await page.waitForFunction(
      (expected) => new URL(location.href).searchParams.get('tag') === expected,
      tag,
      { timeout: 10000 }
    );
    const expected = index.articles.filter((article) => article.tags.includes(tag)).length;
    assert.equal(await page.locator('li.publication:not([hidden])').count(), expected);
    await page.reload();
    await ready();
    assert.equal(await page.locator('#archive-tag').inputValue(), tag);
    assert.equal(await page.locator('li.publication:not([hidden])').count(), expected);
    await page.locator('#archive-filters button[type="reset"]').click();
    assert.equal(await page.locator('li.publication:not([hidden])').count(), index.articles.length);
    await page.goBack();
    await ready();
    assert.equal(await page.locator('#archive-tag').inputValue(), tag);
    observations.archive = {
      cards: index.articles.length,
      tag,
      matching: expected,
      reload: true,
      reset: true,
      history: true,
    };
    const selected = Object.entries(descriptors).find(([key]) => index.readers[key]);
    if (selected) {
      const [key, descriptor] = selected,
        reader = index.readers[key];
      await page.goto(new URL(descriptor.alias, base).href);
      await ready();
      assert.equal(
        await page.locator('.article-intro .publication-tags a').count(),
        reader.tags.length
      );
      const urls = await page
        .locator('.article-related a')
        .evaluateAll((links) => links.map((link) => link.href));
      assert.deepEqual(
        urls,
        api.related(index, reader).map((article) => new URL(article.url, base).href)
      );
      assert.ok(!urls.includes(new URL(descriptor.alias, base).href));
      observations.reader = { key, tags: reader.tags.length, related: urls.length, urls };
      const isolatedText = await browser.newContext();
      try {
        const poisoned = structuredClone(index);
        poisoned.vocabulary[reader.tags[0]] = '<img src=x onerror="window.tagInjection=true">';
        const target = api.related(poisoned, reader)[0];
        if (target) target.title = '<script>window.tagInjection=true</script>';
        await isolatedText.route('**/publication-index.json', (route) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(poisoned),
          })
        );
        const safe = await isolatedText.newPage();
        await safe.goto(new URL(descriptor.alias, base).href);
        await safe.waitForFunction(() => document.body.dataset.tagsState === 'ready');
        assert.equal(
          await safe.locator('.publication-tags img,.article-related script').count(),
          0
        );
        assert.equal(await safe.evaluate(() => window.tagInjection === true), false);
        assert.ok(
          (await safe.locator('.article-intro .publication-tags').innerText()).includes('<img')
        );
        observations.textSafety = { controlledIndex: true, plainText: true };
      } finally {
        await isolatedText.close();
      }
      for (const mode of ['blocked', 'invalid']) {
        const isolated = await browser.newContext({ viewport: { width: 390, height: 844 } });
        try {
          await isolated.route('**/publication-index.json', (route) =>
            mode === 'blocked'
              ? route.abort()
              : route.fulfill({
                  status: 200,
                  contentType: 'application/json',
                  body: '{"schema":999}',
                })
          );
          const native = await isolated.newPage();
          await native.goto(new URL(descriptor.alias, base).href);
          await native.waitForFunction(() => document.body.dataset.tagsState === 'unavailable');
          assert.ok((await native.locator('.article-body').innerText()).length > 100);
          assert.equal(await native.locator('.article-related,.publication-tags').count(), 0);
          await native.locator('.article-intro a').filter({ hasText: 'Back to Writing' }).click();
          await native.waitForFunction(
            () => document.body.dataset.page === 'writing' && !document.body.dataset.article
          );
          observations[mode] = { nativeArticle: true, writing: true, optionalOnly: true };
        } finally {
          await isolated.close();
        }
      }
    }
    assert.deepEqual(errors, [], 'tag journey has no browser exceptions');
    return { schema: 1, kind: 'publication-tags-journey', pass: true, observations };
  } catch (error) {
    throw new Error(
      error.message +
        '\nTag journey state: ' +
        JSON.stringify(
          await page.evaluate(() => ({
            url: location.href,
            page: document.body.dataset.page,
            tags: document.body.dataset.tagsState,
            selection: document.getElementById('archive-tag')?.value,
            visible: document.querySelectorAll('li.publication:not([hidden])').length,
            scene: document.querySelector('.space-scene')?.dataset.travel,
            focus: document.activeElement?.outerHTML?.slice(0, 500),
          }))
        ) +
        '\nBrowser exceptions: ' +
        JSON.stringify(errors),
      { cause: error }
    );
  } finally {
    await context.close();
  }
}
module.exports = { journey };
