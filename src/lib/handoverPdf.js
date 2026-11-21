import { PDFDocument, PageSizes, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { patientName, postOpDays, diaryDone, localDate } from "./ward.js";

const ink = rgb(0.094, 0.235, 0.208);
const teal = rgb(0.031, 0.467, 0.396);
const muted = rgb(0.33, 0.4, 0.38);
let fontFiles;
async function loadFonts() {
  if (!fontFiles) {
    fontFiles = Promise.all(
      ["Regular", "Bold"].map(async (weight) => {
        const response = await fetch(`/fonts/NotoSans-${weight}.ttf`);
        if (!response.ok)
          throw new Error("Impossibile preparare il PDF. Riprova.");
        return new Uint8Array(await response.arrayBuffer());
      }),
    ).catch((error) => {
      fontFiles = null;
      throw error;
    });
  }
  return fontFiles;
}

export function wrapPdfText(text, font, size, width) {
  const lines = [];
  for (const paragraph of String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width) {
        line = candidate;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }
      for (const character of Array.from(word)) {
        if (line && font.widthOfTextAtSize(line + character, size) > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function createHandoverPdf({
  patients,
  lastSynced,
  onlyNotes = false,
  demo = false,
  generatedAt = new Date(),
  fonts,
}) {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const [regularBytes, boldBytes] = fonts || (await loadFonts());
  const font = await document.embedFont(regularBytes, { subset: true });
  const bold = await document.embedFont(boldBytes, { subset: true });
  document.setTitle("Scolioward - Consegne del reparto");
  document.setCreator("Scolioward");
  document.setCreationDate(generatedAt);
  const dateTime = (date) =>
    new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Rome",
    }).format(date);
  const margin = 40,
    width = PageSizes.A4[0] - margin * 2;
  let page, y;
  const newPage = () => {
    page = document.addPage(PageSizes.A4);
    page.drawText("scolioward", {
      x: margin,
      y: 796,
      font: bold,
      size: 20,
      color: teal,
    });
    page.drawText("Consegne del reparto", {
      x: margin,
      y: 767,
      font: bold,
      size: 16,
      color: ink,
    });
    page.drawText(
      `Esportato il ${dateTime(generatedAt)}${demo ? " - DEMO: pazienti fittizi" : ""}`,
      { x: margin, y: 746, font, size: 9, color: muted },
    );
    page.drawText(
      `Ultimo aggiornamento: ${lastSynced ? dateTime(new Date(lastSynced)) : demo ? "Dati dimostrativi" : "Non disponibile"}`,
      { x: margin, y: 731, font, size: 9, color: muted },
    );
    page.drawText(
      `${onlyNotes ? "Solo con consegna" : "Da riprendere al giro"} - ${patients.length} ${patients.length === 1 ? "paziente" : "pazienti"}`,
      { x: margin, y: 716, font, size: 9, color: muted },
    );
    y = 686;
  };
  newPage();
  if (!patients.length)
    page.drawText("Nessuna consegna nella vista selezionata.", {
      x: margin,
      y,
      font,
      size: 11,
      color: ink,
    });
  for (const patient of patients) {
    const name = patientName(patient);
    const fields = [
      [name, bold, 13, teal],
      [
        `Letto ${patient.bedNumber || "-"} · ${patient.location || "-"} · Giornata ${postOpDays(patient.operationDate)}`,
        bold,
        10,
        ink,
      ],
      [`Diagnosi: ${patient.diagnosis || "Non indicata"}`, font, 10, ink],
      [
        `Referente: ${patient.consultant || "Da assegnare"} · Specializzando: ${patient.resident || "Da assegnare"}`,
        font,
        10,
        ink,
      ],
      [
        `CV: ${patient.hasCV ? "presente" : "assente"} · Drenaggio: ${patient.hasDrainage ? "presente" : "assente"}`,
        font,
        10,
        ink,
      ],
      [
        `Diaria: ${diaryDone(patient) ? "aggiornata" : "da aggiornare"} · RX: ${patient.rxStatus || "Non richiesta"}`,
        font,
        10,
        ink,
      ],
      ...(postOpDays(patient.operationDate) >= 2 &&
      (patient.hasCV || patient.hasDrainage)
        ? [["Presidi da rivalutare", bold, 10, ink]]
        : []),
      ...(patient.writtenDischarge
        ? [["Lettera di dimissione pronta", font, 10, ink]]
        : []),
      [
        `Consegna: ${patient.handover || "Nessuna consegna annotata."}`,
        font,
        11,
        ink,
      ],
    ];
    const lines = fields.flatMap(([text, face, size, color]) =>
      wrapPdfText(text, face, size, width).map((text) => ({
        text,
        face,
        size,
        color,
      })),
    );
    const height = lines.length * 16 + 18;
    if (y < 686 && y - Math.min(height, 630) < 65) newPage();
    for (const line of lines) {
      if (y < 65) {
        newPage();
        for (const text of wrapPdfText(`${name} (continua)`, bold, 11, width)) {
          page.drawText(text, {
            x: margin,
            y,
            font: bold,
            size: 11,
            color: teal,
          });
          y -= 16;
        }
        y -= 6;
      }
      if (line.text)
        page.drawText(line.text, {
          x: margin,
          y,
          font: line.face,
          size: line.size,
          color: line.color,
        });
      y -= 16;
    }
    y -= 18;
  }
  document.getPages().forEach((sheet, index, pages) => {
    sheet.drawText("Scolioward · Chirurgia vertebrale", {
      x: margin,
      y: 30,
      font,
      size: 8,
      color: muted,
    });
    const number = `${index + 1} / ${pages.length}`;
    sheet.drawText(number, {
      x: PageSizes.A4[0] - margin - font.widthOfTextAtSize(number, 8),
      y: 30,
      font,
      size: 8,
      color: muted,
    });
  });
  return {
    bytes: await document.save(),
    filename: `scolioward-consegne-${localDate(generatedAt)}.pdf`,
  };
}
