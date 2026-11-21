import { useEffect, useState } from "react";
import { Share2, Download } from "lucide-react";
import { canSharePdf, sharePdf, downloadPdf } from "../lib/sharePdf";

export default function ShareHandoverPdf({
  patients,
  lastSynced,
  onlyNotes,
  demo,
  unavailable,
}) {
  const [prepared, setPrepared] = useState(null);
  const [failure, setFailure] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState("");
  const snapshot = JSON.stringify({ patients, lastSynced, onlyNotes, demo });
  useEffect(() => {
    if (unavailable) return;
    let cancelled = false;
    import("../lib/handoverPdf")
      .then(({ createHandoverPdf }) => createHandoverPdf(JSON.parse(snapshot)))
      .then(({ bytes, filename }) => {
        if (!cancelled) {
          setFailure(null);
          setPrepared({
            snapshot,
            file: new File([bytes], filename, { type: "application/pdf" }),
          });
        }
      })
      .catch((error) => {
        if (!cancelled) setFailure({ snapshot, message: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot, unavailable, retry]);
  const file =
    !unavailable && prepared?.snapshot === snapshot ? prepared.file : null;
  const error = failure?.snapshot === snapshot ? failure.message : "";
  const share = async () => {
    if (!file || sharing) return;
    setSharing(true);
    setNotice("");
    try {
      const result = await sharePdf(file, { download: downloadPdf });
      if (result === "downloaded")
        setNotice("PDF scaricato. Puoi allegarlo a WhatsApp.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSharing(false);
    }
  };
  return (
    <div className="share-report">
      <div className="share-report-actions">
        <button
          className="button secondary"
          onClick={share}
          disabled={!file || sharing}
        >
          <Share2 size={16} />
          {sharing
            ? "Condivisione…"
            : !file && !unavailable && !error
              ? "Preparazione PDF…"
              : "Condividi PDF"}
        </button>
        {file && canSharePdf(file) && (
          <button
            className="button secondary"
            onClick={() => downloadPdf(file)}
            disabled={sharing}
          >
            <Download size={16} />
            Scarica PDF
          </button>
        )}
      </div>
      {error && (
        <button
          className="text-link"
          onClick={() => {
            setFailure(null);
            setRetry(retry + 1);
          }}
        >
          Riprova PDF
        </button>
      )}
      {(error || notice) && (
        <p role={error ? "alert" : "status"}>{error || notice}</p>
      )}
    </div>
  );
}
