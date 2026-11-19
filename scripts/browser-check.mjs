import assert from "node:assert/strict";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";
const { Browser, sleep } = await import(
  pathToFileURL(
    (process.env.TASTE_SKILL_ROOT ||
      homedir() + "/.codex/skills/design-taste-frontend") +
      "/scripts/lib/cdp.mjs",
  )
);
const browser = await Browser.launch();
const page = await browser.newPage({ width: 1440, height: 900 });
const fill = async (selector, value) => {
  await page.eval(
    ({ selector, value }) => {
      const e = document.querySelector(selector);
      const setter = Object.getOwnPropertyDescriptor(
        e instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(e, value);
      e.dispatchEvent(new Event("input", { bubbles: true }));
    },
    { selector, value },
  );
  await sleep(100);
};
const click = async (selector) => {
  await page.eval(
    (selector) => document.querySelector(selector).click(),
    selector,
  );
  await sleep(200);
};
try {
  await page.goto("http://127.0.0.1:5173/?demo=1");
  assert.equal(
    await page.eval(() => document.querySelectorAll("tbody tr").length),
    6,
  );
  await fill("input[type=search]", "Marini");
  assert.equal(
    await page.eval(() => document.querySelectorAll("tbody tr").length),
    1,
  );
  await fill("input[type=search]", "");
  await click("tbody tr:nth-child(2) .diary-button");
  assert.equal(
    await page.eval(
      () =>
        document.querySelector("tbody tr:nth-child(2) .diary-button")
          .textContent,
    ),
    "Aggiornata",
  );
  await click('a[href="/add"].button');
  await fill("input[name=firstName]", "Test");
  await fill("input[name=lastName]", "Dimostrativo");
  await fill("input[name=diagnosis]", "Scheda dimostrativa");
  await page.eval(() => document.querySelector("form").requestSubmit());
  await sleep(300);
  assert.equal(
    await page.eval(() => document.querySelectorAll("tbody tr").length),
    7,
  );
  await click("tbody tr:first-child .patient-name");
  await fill("textarea[name=notes]", "Nota dimostrativa verificata");
  await page.eval(() => document.querySelector("form").requestSubmit());
  await sleep(300);
  assert.match(
    await page.eval(
      () => document.querySelector("[role=status]")?.textContent || "",
    ),
    /salvate/,
  );
  await click('a[href="/handover"]');
  assert.equal(
    await page.eval(() => document.querySelector("h1").textContent),
    "Consegne del reparto",
  );
  await click('a[href="/archive"]');
  assert.match(
    await page.eval(() => document.querySelector(".empty-state").textContent),
    /Nessun paziente dimesso/,
  );
  await click(".sidebar-bottom>button");
  assert.equal(
    await page.eval(() => document.querySelector("dialog").open),
    true,
  );
  await page.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27,
  });
  await page.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await sleep(200);
  assert.equal(
    await page.eval(() => !!document.querySelector("dialog")),
    false,
  );
  await page.setViewport({ width: 390, height: 844, mobile: true });
  await click('.bottom-nav a[href="/"]');
  assert.equal(
    await page.eval(() => document.documentElement.scrollWidth <= innerWidth),
    true,
  );
  assert.equal(
    await page.eval(
      () => getComputedStyle(document.querySelector(".sidebar")).display,
    ),
    "none",
  );
  console.log(
    "PASS: browser demo: search, diary save, create, detail edit, handover, archive empty, settings/Escape, mobile layout.",
  );
} finally {
  await browser.close();
}
