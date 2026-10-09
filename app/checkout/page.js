"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function Checkout() {
  const router = useRouter();
  const cart = useCart();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [codigoArea, setCodigoArea] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Registrar cada producto como venta (sin descontar stock)
    for (const item of cart.items) {
      await supabase.from("ventas").insert({
        producto_id: item.id,
        producto_nombre: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        comprador: `${nombre} ${apellido}`,
        medio_pago: "efectivo",
        tipo_venta: "web",
        fecha: new Date().toISOString().slice(0, 10),
      });
    }

    // Generar número de pedido
    const newOrderId = `JN-${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);

    // Enviar email automático a julisirotiuk@gmail.com
    const emailHtml = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2d2a26; margin-bottom: 20px;">Nuevo pedido ${newOrderId}</h2>
        <div style="background: #f5f0e8; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 4px 0;"><strong>Nombre:</strong> ${nombre} ${apellido}</p>
          <p style="margin: 4px 0;"><strong>Provincia:</strong> ${provincia}</p>
          <p style="margin: 4px 0;"><strong>Localidad:</strong> ${localidad}</p>
          <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${codigoArea} ${telefono}</p>
        </div>
        <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #e0dcd0;">
          <h3 style="color: #2d2a26; margin-bottom: 12px;">Productos</h3>
          ${cart.items.map((i) => `<p style="margin: 4px 0; display: flex; justify-content: space-between;"><span>${i.nombre} x${i.cantidad}</span><span>${money(i.precio * i.cantidad)}</span></p>`).join("")}
          <div style="border-top: 1px solid #e0dcd0; margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between; font-weight: 700;">
            <span>Total</span>
            <span style="color: #4c8a3f;">${money(cart.total)}</span>
          </div>
        </div>
      </div>
    `;

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "julisirotiuk@gmail.com",
          subject: `Nuevo pedido ${newOrderId} - JN MATES`,
          html: emailHtml,
        }),
      });
    } catch (error) {
      console.error("Error enviando email:", error);
    }

    cart.clear();
    setSaving(false);
  };

  if (cart.items.length === 0 && !orderId) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Carrito vacío</div>
          <div style={{ fontSize: 13, color: "#8fa085", marginBottom: 20 }}>Agregá productos para continuar</div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={styles.btn}>Volver a la tienda</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link href="/" style={{ textDecoration: "none", color: "#4c8a3f", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver a la tienda
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <ShoppingBag size={20} color="#4c8a3f" />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Finalizar pedido</span>
        </div>

        {orderId ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle size={48} color="#4c8a3f" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¡Pedido registrado!</div>
            <div style={{ fontSize: 14, color: "#6b6560", marginBottom: 4 }}>
              Número de pedido: <b style={{ color: "#4c8a3f", fontSize: 16 }}>{orderId}</b>
            </div>
            <div style={{ fontSize: 13, color: "#8fa085", marginBottom: 20, lineHeight: 1.5 }}>
              ¡Gracias por tu compra!<br />
              <b>Nos contactaremos a la brevedad</b> para coordinar el pago y la entrega.
            </div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={styles.btn}>Volver a la tienda</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Nombre</label>
                <input
                  required
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Apellido</label>
                <input
                  required
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Provincia</label>
                <input
                  required
                  placeholder="Ej: Mendoza"
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Localidad</label>
                <input
                  required
                  placeholder="Ej: Bowen"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Código de área</label>
                <input
                  required
                  placeholder="Ej: 2622"
                  value={codigoArea}
                  onChange={(e) => setCodigoArea(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Teléfono</label>
                <input
                  required
                  placeholder="Ej: 5551234"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: "#f5f0e8", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Resumen del pedido</div>
              {cart.items.map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{i.nombre} × {i.cantidad}</span>
                  <span>{money(i.precio * i.cantidad)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: "1px solid #e0dcd0" }}>
                <span>Total</span>
                <span style={{ color: "#4c8a3f" }}>{money(cart.total)}</span>
              </div>
            </div>

            <button type="submit" disabled={saving} style={{ ...styles.btn, marginTop: 16, width: "100%" }}>
              {saving ? "Procesando..." : "Confirmar pedido"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f5f0e8 0%, #ede8dd 50%, #f5f0e8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: 16,
    padding: 24,
    backdropFilter: "blur(10px)",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  label: { color: "#6b6560", fontSize: 12, marginTop: 10, marginBottom: 4, display: "block" },
  input: {
    background: "#fff",
    border: "1px solid #e0dcd0",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#2d2a26",
    fontSize: 14,
    outline: "none",
    width: "100%",
  },
  btn: {
    background: "linear-gradient(135deg, #4c8a3f 0%, #5a9a4a 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-block",
  },
};
