import { expect, test } from "@playwright/test";

test("developer can browse catalog, create an environment, and review admin readiness", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Developer portal" })).toBeVisible();
  await expect(page.getByText("Launch governed developer environments in minutes.")).toBeVisible();

  await page.getByRole("button", { name: "Catalog", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Golden path catalog" })).toBeVisible();

  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.getByRole("heading", { name: "Template details" })).toBeVisible();
  await expect(page.getByText("Integration readiness")).toBeVisible();

  await page.getByRole("button", { name: "Use this golden path" }).click();
  await expect(page.getByRole("heading", { name: "Create environment" })).toBeVisible();
  await page.getByLabel("Environment name").fill("smoke-api-dev");
  await page.getByRole("button", { name: "Launch simulated provisioning" }).click();

  await expect(page.getByRole("heading", { name: "Environment status" })).toBeVisible();
  await expect(page.getByText("Provisioning job queued")).toBeVisible();
  await expect(page.getByText("Template validated")).toBeVisible();

  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Platform admin" })).toBeVisible();
  await expect(page.getByText("Template governance")).toBeVisible();
  await expect(page.getByText("Integration readiness")).toBeVisible();
});
