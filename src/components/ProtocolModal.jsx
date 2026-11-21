import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import Modal from "./Modal";

export default function ProtocolModal({ onClose }) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <Modal title="Protocollo ERAS" className="protocol-modal" onClose={onClose}>
      <div className="protocol-toolbar">
        <button
          className="button secondary"
          onClick={() => setZoomed(!zoomed)}
          aria-pressed={zoomed}
        >
          {zoomed ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
          {zoomed ? "Adatta alla finestra" : "Ingrandisci"}
        </button>
      </div>
      <div
        className={`protocol-image-view ${zoomed ? "zoomed" : ""}`}
        tabIndex={0}
        aria-label="Immagine del protocollo ERAS, scorribile"
      >
        <img
          src="/protocollo-eras.jpeg"
          width="720"
          height="1423"
          alt="ERAS Protocol: postoperative management in scoliosis surgery, dalle fasi intraoperatoria e ICU fino alla dimissione."
        />
      </div>
    </Modal>
  );
}
