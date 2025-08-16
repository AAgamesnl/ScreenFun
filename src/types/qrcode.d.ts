declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>;
  export function toDataURL(text: string, options: any): Promise<string>;
  // Add other QRCode methods as needed
}
