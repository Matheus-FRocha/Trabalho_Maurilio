import { test, expect } from "@playwright/test";

test("logo goes home without reload or leaving and can resume the same room", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("connection")).toHaveText("Conectado");
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByRole("button", { name: "Criar uma mesa" }).click();
  const code = await page.getByTestId("room-code").innerText();
  await page.evaluate(() => {
    window.navigationProbe = "same-document";
  });
  await page.getByRole("link", { name: "Pife, início" }).click();
  await expect(
    page.getByRole("heading", { name: "A mesa está pronta." }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.navigationProbe)).toBe(
    "same-document",
  );
  await expect(
    page.getByRole("button", { name: "Retomar mesa" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Retomar mesa" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retomar mesa" }).click();
  await expect(page.getByTestId("room-code")).toHaveText(code);
});
