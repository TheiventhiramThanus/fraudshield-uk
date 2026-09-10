import { expect, test } from "@playwright/test";

test.describe("FraudShield public workflow", () => {
  for (const route of ["/", "/analyse", "/url-checker", "/dashboard", "/model-performance", "/about"]) {
    test(`public route ${route} does not render a 404 page`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByText("Page not found", { exact: true })).toHaveCount(0);
      await expect(page.locator("main")).toBeVisible();
    });
  }

  test("home page exposes public navigation without Research", async ({ page }, testInfo) => {
    await page.goto("/");
    if (testInfo.project.name === "mobile-chrome") {
      await page.getByRole("button", { name: "Toggle menu" }).click();
    }
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Analyse", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "URL Checker", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Report a Scam", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();
    await expect(page.getByText("Research", { exact: true })).toHaveCount(0);
  });

  test("message analysis reaches the local API and displays explainable results", async ({ page }) => {
    await page.goto("/analyse");
    await page.getByLabel("Message Content").fill(
      "Urgent: your bank account is suspended. Verify your password at http://verify-bank-login.example"
    );
    await page.getByRole("button", { name: "Analyse Message" }).click();
    await expect(page.getByRole("heading", { name: "Analysis Result" })).toBeVisible();
    await expect(page.getByText("Bank Impersonation")).toBeVisible();
    await expect(page.getByText("Credential or authentication request detected")).toBeVisible();
  });

  test("URL analysis reaches the local API and displays risk features", async ({ page }) => {
    await page.goto("/url-checker");
    await page.getByLabel("URL to Analyse").fill("http://secure-login-bank-update.example/verify");
    await page.getByRole("button", { name: "Check URL" }).click();
    await expect(page.getByRole("heading", { name: "URL Risk Assessment" })).toBeVisible();
    await expect(page.getByText("No HTTPS encryption detected")).toBeVisible();
    await expect(page.getByText("URL Shortener")).toBeVisible();
  });
});

test.describe("Authentication and access controls", () => {
  for (const route of ["/report", "/history", "/admin"]) {
    test(`anonymous visitor is redirected from ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    });
  }

  test("login and registration pages render without exposing an admin route", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByText("Administration dashboard")).toHaveCount(0);

    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /create/i })).toBeVisible();
  });
});

test("local FastAPI health endpoint responds", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:8000/api/v1/health");
  await expect(response).toBeOK();
  await expect(response.json()).resolves.toMatchObject({ status: "ok", service: "fraudshield-api" });
});
