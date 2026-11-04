import { test, expect } from "@playwright/test";

test("leaving alone cancels waiting room without showing a game or draw", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("connection")).toHaveText("Conectado");
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByRole("button", { name: "Criar uma mesa" }).click();
  await expect(page.getByTestId("room-code")).toBeVisible();
  await page.getByRole("button", { name: "Sair da sala" }).click();
  await expect(
    page.getByRole("heading", { name: "Sala encerrada" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deu empate." })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Comprar do monte" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("hand-card")).toHaveCount(0);
  await page.screenshot({
    path: "../output/screenshots/sala-cancelada.png",
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sala encerrada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao início" }).click();
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByRole("button", { name: "Criar uma mesa" }).click();
  await expect(
    page.getByRole("heading", { name: "Melhor com companhia." }),
  ).toBeVisible();
});

test("leaving a two-player waiting room cancels for both without a winner", async ({
  browser,
}) => {
  const first = await browser.newContext(),
    second = await browser.newContext();
  try {
    const a = await first.newPage(),
      b = await second.newPage();
    await a.goto("/");
    await b.goto("/");
    await expect(a.getByTestId("connection")).toHaveText("Conectado");
    await a.getByLabel("Seu nome").fill("Ana");
    await a.getByRole("button", { name: "Criar uma mesa" }).click();
    const code = await a.getByTestId("room-code").innerText();
    await b.getByRole("button", { name: "Entrar com código" }).click();
    await b.getByLabel("Seu nome").fill("Beto");
    await b.getByLabel("Código da sala").fill(code);
    await b
      .getByRole("button", { name: "Entrar na mesa", exact: true })
      .click();
    await expect(a.getByText("Beto", { exact: true }).first()).toBeVisible();
    await b.getByRole("button", { name: "Sair da sala" }).click();
    for (const page of [a, b]) {
      await expect(
        page.getByRole("heading", { name: "Sala encerrada" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Você venceu!" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: "Deu empate." }),
      ).toHaveCount(0);
    }
  } finally {
    await first.close();
    await second.close();
  }
});
