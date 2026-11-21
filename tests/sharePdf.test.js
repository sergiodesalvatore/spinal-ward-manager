import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { sharePdf } from "../src/lib/sharePdf.js";
import { createHandoverPdf } from "../src/lib/handoverPdf.js";
const file = new File(["%PDF-test"], "consegne.pdf", {
  type: "application/pdf",
});

test("File sharing starts synchronously on click and passes the PDF rather than a link", async () => {
  let received;
  const target = {
    canShare: ({ files }) => files[0].type === "application/pdf",
    share: (data) => {
      received = data;
      return Promise.resolve();
    },
  };
  const result = sharePdf(file, {
    target,
    download: () => assert.fail("Unexpected download"),
  });
  assert.equal(received.files[0], file);
  assert.equal(received.url, undefined);
  assert.equal(await result, "shared");
});

test("Unsupported file sharing downloads the PDF attachment", async () => {
  let downloaded;
  const result = await sharePdf(file, {
    target: { canShare: () => false },
    download: (attachment) => {
      downloaded = attachment;
    },
  });
  assert.equal(result, "downloaded");
  assert.equal(downloaded, file);
});

test("Cancelling the share sheet does not download or share anything else", async () => {
  const result = await sharePdf(file, {
    target: {
      canShare: () => true,
      share: async () => {
        throw Object.assign(new Error(), { name: "AbortError" });
      },
    },
    download: () => assert.fail("Cancellation must not start a download"),
  });
  assert.equal(result, "cancelled");
});

test("A rejected file share provides the explicit download alternative", async () => {
  await assert.rejects(
    sharePdf(file, {
      target: {
        canShare: () => true,
        share: async () => {
          throw new Error("Unavailable");
        },
      },
      download: () =>
        assert.fail("A rejected share must not download automatically"),
    }),
    /Scarica PDF/,
  );
});

test("Real PDF output paginates long Unicode handovers and names files by Rome date", async () => {
  const fonts = await Promise.all(
    ["Regular", "Bold"].map((weight) =>
      readFile(
        new URL(`../public/fonts/NotoSans-${weight}.ttf`, import.meta.url),
      ),
    ),
  );
  const generatedAt = new Date("2026-11-21T23:30:00Z");
  const empty = await createHandoverPdf({ patients: [], fonts, generatedAt });
  assert.equal((await PDFDocument.load(empty.bytes)).getPageCount(), 1);
  assert.equal(empty.filename, "scolioward-consegne-2026-11-22.pdf");
  const long = await createHandoverPdf({
    patients: [
      {
        firstName: "Giò",
        lastName: "D’Angelo",
        handover: "Controllo μg/kg, ±, L4–L5.\n".repeat(180),
      },
    ],
    fonts,
    generatedAt,
  });
  const pdf = await PDFDocument.load(long.bytes);
  assert.ok(pdf.getPageCount() > 1);
  assert.equal(pdf.getTitle(), "Scolioward - Consegne del reparto");
  assert.ok(
    long.bytes.length < 100000,
    "Only the font glyphs in use should be embedded",
  );
});
