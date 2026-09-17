import { CartProvider } from "@/lib/CartContext";

export const metadata = {
  title: "JN Mates",
  description: "Mates, yerba y accesorios artesanales",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131c15",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#131c15" }}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
