import { useCallback, useEffect, useRef, useState } from "react";
import { ScanBarcode, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeBarcode, expandUPCE } from "@shared/barcodes";
import type { IScannerControls } from "@zxing/browser";

export default function BarcodeScanner({
  onScan,
  startImmediately = false,
  active = true,
}: {
  onScan: (code: string) => void;
  startImmediately?: boolean;
  active?: boolean;
}) {
  const [open, setOpen] = useState(startImmediately);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const controls = useRef<IScannerControls | null>(null);
  const generation = useRef(0);
  const photoGeneration = useRef(0);
  const scanCallback = useRef(onScan);
  scanCallback.current = onScan;
  const stop = useCallback(() => {
    generation.current++;
    controls.current?.stop();
    controls.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);
  const close = useCallback(() => {
    stop();
    setOpen(false);
    setBusy(false);
  }, [stop]);
  useEffect(()=>{if(!active){photoGeneration.current++;close();}},[active,close]);
  useEffect(
    () => () => {
      photoGeneration.current++;
      stop();
    },
    [stop],
  );
  async function reader() {
    const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
      await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    return {
      reader: new BrowserMultiFormatReader(hints),
      convert: (result: any) =>
        normalizeBarcode(
          result.getBarcodeFormat() === BarcodeFormat.UPC_E
            ? expandUPCE(result.getText()) || ""
            : result.getText(),
        ),
    };
  }
  useEffect(() => {
    if (!open||!active) return;
    const ticket = ++generation.current;
    setMessage("");
    setBusy(true);
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext)
        throw Error("unsupported");
      const decoder = await reader();
      if (generation.current !== ticket) return;
      const media = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (generation.current !== ticket) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const started = await decoder.reader.decodeFromStream(
        media,
        video.current!,
        (result, _error, current) => {
          if (!result || generation.current !== ticket) return;
          const code = decoder.convert(result);
          if (!code) return;
          current.stop();
          close();
          setMessage(`Barcode ${code} scanned. Finding the product…`);
          scanCallback.current(code);
        },
      );
      if (generation.current !== ticket) {
        started.stop();
        return;
      }
      controls.current = started;
      setBusy(false);
      setMessage(
        "Center the package barcode in the frame. Hold steady in good light.",
      );
    })().catch((error) => {
      if (generation.current !== ticket) return;
      close();
      setMessage(
        error?.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access in your browser settings, use a barcode photo, or enter the number below."
          : "The camera could not start. Try a barcode photo or enter the number below.",
      );
    });
    const hidden = () => {
      if (document.hidden) close();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      stop();
    };
  }, [open, active, stop, close]);
  return (
    <section className="barcode-scanner" aria-label="Package barcode scanner">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy && !open}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <ScanBarcode size={18} className="mr-2" />
          {open ? "Stop scanning" : "Scan barcode"}
        </Button>
        <label className="barcode-photo-button">
          <Camera size={17} />
          Use a barcode photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              close();
              if (file.size > 15000000) {
                setMessage("Choose a barcode photo smaller than 15 MB.");
                return;
              }
              const ticket = ++photoGeneration.current;
              let url = "";
              setBusy(true);
              setMessage("Reading the barcode on your device…");
              try {
                const decoder = await reader();
                url = URL.createObjectURL(file);
                const result = await decoder.reader.decodeFromImageUrl(url),
                  code = decoder.convert(result);
                if (photoGeneration.current !== ticket) return;
                if (!code) throw Error("invalid");
                setMessage(`Barcode ${code} scanned. Finding the product…`);
                scanCallback.current(code);
              } catch {
                if (photoGeneration.current === ticket)
                  setMessage(
                    "No readable package barcode found. Try a closer, well-lit photo or enter its number below.",
                  );
              } finally {
                if (url) URL.revokeObjectURL(url);
                if (photoGeneration.current === ticket) setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {open && (
        <div className="barcode-camera">
          <video
            ref={video}
            muted
            playsInline
            autoPlay
            aria-label="Live package barcode camera"
          />
          <div className="barcode-guide" aria-hidden="true" />
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            aria-label="Close barcode camera"
          >
            <X size={18} />
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className="panel-note">
          {message}
        </p>
      )}
      <p className="panel-note">
        Food and supplement barcodes are read on your device. Only the barcode
        number goes to product search. Confirm the exact formula and serving.
      </p>
    </section>
  );
}
