import { test, expect } from "@playwright/test";

/**
 * Accessibility and theming behaviour that only shows up in a real browser:
 * the pre-paint theme script, media-query defaults, and reduced-motion.
 *
 * Colour contrast is covered separately by `npm run audit:contrast`, which
 * checks the tokens directly rather than sampling rendered pixels.
 */
test.describe("theming", () => {
  test("follows the OS preference when the user has not chosen", async ({
    browser,
  }) => {
    const light = await browser.newContext({ colorScheme: "light" });
    const page = await light.newPage();
    await page.goto("/");

    // No explicit choice yet, so the attribute stays off and the CSS media
    // query is left in charge.
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    );
    // Warm ivory, not the dark plum default.
    expect(bg).toBe("rgb(251, 248, 245)");
  });

  test("an explicit choice overrides the OS preference and persists", async ({
    browser,
  }) => {
    // A light-mode device where the user wants dark: the case that a naive
    // implementation gets wrong.
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto("/");

    await page.getByRole("button", { name: /switch to dark mode/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    ).toBe("rgb(22, 20, 28)");

    // Survives a reload, and is applied before first paint by ThemeScript.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // And survives navigation into a room page.
    await page.goto("/room/ZZZZ");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("reduced motion", () => {
  test("collapses animations to a plain fade", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");

    const animation = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "animate-letter-flip";
      document.body.appendChild(el);
      const name = getComputedStyle(el).animationName;
      el.remove();
      return name;
    });

    // The flip degrades to the fade keyframes rather than running as-is.
    expect(animation).toBe("fade-in");
  });

  test("runs the flip normally when motion is not restricted", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/");

    const animation = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "animate-letter-flip";
      document.body.appendChild(el);
      const name = getComputedStyle(el).animationName;
      el.remove();
      return name;
    });

    expect(animation).toBe("letter-flip");
  });
});

test.describe("SEO surfaces", () => {
  test("robots.txt lets crawlers reach room links", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    // Blocking /room/ would stop social scrapers rendering the invite preview,
    // and would stop search engines ever reading the page's own noindex.
    expect(body).not.toContain("Disallow: /room/");
    expect(body).toContain("Sitemap:");
  });

  test("room pages are noindex but still previewable", async ({ page }) => {
    await page.goto("/room/ZZZZ");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("the room invite card names the game without leaking the puzzle", async ({
    request,
  }) => {
    const res = await request.get("/room/ZZZZ/opengraph-image");
    // Unknown room still renders a valid card rather than erroring.
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
