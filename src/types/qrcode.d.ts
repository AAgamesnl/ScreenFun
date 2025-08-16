// Minimal type declarations for the 'qrcode' package to satisfy the compiler
// Extend as needed if you start using more APIs.
declare module "qrcode" {
  export interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    type?: "image/png" | "image/jpeg" | "image/webp";
    quality?: number; // for jpeg/webp
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string; // CSS color or hex
      light?: string; // CSS color or hex
    };
  }

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;
  export function toDataURL(
    text: string,
    options: QRCodeToDataURLOptions,
    cb: (err: Error | null, url: string) => void
  ): void;
  export function toDataURL(
    text: string,
    cb: (err: Error | null, url: string) => void
  ): void;

  const QRCode: {
    toDataURL: typeof toDataURL;
  };
  export default QRCode;
}
