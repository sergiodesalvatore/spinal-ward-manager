export function canSharePdf(file, target = navigator) {
  return Boolean(target.share && target.canShare?.({ files: [file] }));
}

export async function sharePdf(file, { target = navigator, download } = {}) {
  if (canSharePdf(file, target)) {
    try {
      // Called directly from the click: the ready file preserves mobile user activation.
      await target.share({
        files: [file],
        title: "Scolioward - Consegne del reparto",
      });
      return "shared";
    } catch (error) {
      if (error.name === "AbortError") return "cancelled";
      throw new Error(
        "Condivisione non riuscita. Puoi usare Scarica PDF e allegarlo a WhatsApp.",
      );
    }
  }
  download(file);
  return "downloaded";
}

export function downloadPdf(file) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
