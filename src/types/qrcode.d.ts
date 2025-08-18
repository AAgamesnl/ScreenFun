declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>;
  export function toDataURL(text: string, options: any): Promise<string>;
  export function toBuffer(text: string, options: any): Promise<Buffer>;
  // Add other QRCode methods as needed
}
