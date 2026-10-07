import { CartProvider } from "@/lib/CartContext";

export const metadata = {
  title: "JN Mates",
  description: "Mates, yerba y accesorios artesanales",
  openGraph: {
    title: "JN Mates",
    description: "Mates, yerba y accesorios artesanales",
    images: ["/logo.jpeg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JN Mates",
    description: "Mates, yerba y accesorios artesanales",
    images: ["/logo.jpeg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f0e8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#f5f0e8" }}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
