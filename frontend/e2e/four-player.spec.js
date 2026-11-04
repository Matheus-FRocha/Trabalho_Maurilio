import { test, expect } from "@playwright/test";

test("four players use two decks, rotate turns, navigate home and continue after exits", async ({
  browser,
}) => {
  const contexts = await Promise.all(
    Array.from({ length: 4 }, () => browser.newContext()),
  );
  try {
    const pages = await Promise.all(
      contexts.map((context) => context.newPage()),
    );
    const names = ["Ana", "Beto", "Caio", "Dora"];
    await Promise.all(pages.map((page) => page.goto("/")));
    const [a, b, c, d] = pages;
    await expect(a.getByTestId("connection")).toHaveText("Conectado");
    await a.getByLabel("Seu nome").fill(names[0]);
    await a.getByRole("radio", { name: "4 jogadores", exact: true }).check();
    await a.getByRole("button", { name: "Criar uma mesa" }).click();
    const code = await a.getByTestId("room-code").innerText();
    for (let index = 1; index < 4; index++) {
      await expect(
        a.getByRole("button", { name: "Começar partida" }),
      ).toBeDisabled();
      await pages[index]
        .getByRole("button", { name: "Entrar com código" })
        .click();
      await pages[index].getByLabel("Seu nome").fill(names[index]);
      await pages[index].getByLabel("Código da sala").fill(code);
      await pages[index]
        .getByRole("button", { name: "Entrar na mesa", exact: true })
        .click();
      await expect(
        a.getByText(names[index], { exact: true }).first(),
      ).toBeVisible();
    }
    await a.getByRole("button", { name: "Começar partida" }).click();
    for (const page of pages) {
      await expect(page.getByTestId("hand-card")).toHaveCount(9);
      await expect(page.getByRole("group", { name: /^Jogador / })).toHaveCount(
        3,
      );
      await expect(page.getByText("67 cartas restantes")).toBeVisible();
    }
    await a.screenshot({
      path: "../output/screenshots/mesa-quatro-desktop.png",
      fullPage: true,
    });
    await a.setViewportSize({ width: 390, height: 844 });
    expect(
      await a.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await a.screenshot({
      path: "../output/screenshots/mesa-quatro-mobile.png",
      fullPage: true,
    });
    await a.setViewportSize({ width: 1280, height: 900 });
    await a.evaluate(() => {
      window.navigationProbe = "same-document";
    });
    await a.getByRole("link", { name: "Pife, início" }).click();
    await expect(a.getByRole("button", { name: "Retomar mesa" })).toBeVisible();
    expect(await a.evaluate(() => window.navigationProbe)).toBe(
      "same-document",
    );
    await a.getByRole("button", { name: "Retomar mesa" }).click();
    await expect(a.getByTestId("room-code")).toHaveText(code);
    for (const page of pages) {
      await expect(
        page.getByRole("button", { name: "Comprar do monte" }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "Comprar do monte" }).click();
      await expect(page.getByTestId("hand-card")).toHaveCount(10);
      await page.getByTestId("hand-card").last().click();
      await page.getByRole("button", { name: "Descartar selecionada" }).click();
      await expect(page.getByTestId("hand-card")).toHaveCount(9);
    }
    await d.getByRole("button", { name: "Sair da partida" }).click();
    await expect(
      d.getByRole("heading", { name: "Você saiu da partida" }),
    ).toBeVisible();
    await d.getByRole("button", { name: "Voltar ao início" }).click();
    await d.getByLabel("Seu nome").fill("Dora");
    await d.getByRole("button", { name: "Criar uma mesa" }).click();
    const newCode = await d.getByTestId("room-code").innerText();
    await expect(
      a.getByRole("button", { name: "Comprar do monte" }),
    ).toBeEnabled();
    await a.getByRole("button", { name: "Comprar do monte" }).click();
    await expect(a.getByTestId("hand-card")).toHaveCount(10);
    await a.getByRole("button", { name: "Sair da partida" }).click();
    await expect(
      a.getByRole("heading", { name: "Você saiu da partida" }),
    ).toBeVisible();
    await expect(
      b.getByRole("button", { name: "Comprar do monte" }),
    ).toBeEnabled();
    await b.getByRole("button", { name: "Sair da partida" }).click();
    await expect(
      c.getByRole("heading", { name: "Você venceu!" }),
    ).toBeVisible();
    await expect(
      c.getByText(
        "Você é o último participante da mesa. Vitória por abandono.",
      ),
    ).toBeVisible();
    await expect(d.getByTestId("room-code")).toHaveText(newCode);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
