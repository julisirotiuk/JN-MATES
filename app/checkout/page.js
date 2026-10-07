"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
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
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setOk("");

    // Registrar cada producto como venta
    for (const item of cart.items) {
      const { data: producto } = await supabase
        .from("productos")
        .select("id, stock, precio")
        .eq("id", item.id)
        .single();

      if (producto) {
        await supabase.from("ventas").insert({
          producto_id: producto.id,
          producto_nombre: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          comprador: nombre || null,
          medio_pago: "efectivo",
          tipo_venta: "web",
          fecha: new Date().toISOString().slice(0, 10),
        });

        await supabase.from("productos").update({
          stock: Number(producto.stock || 0) - item.cantidad,
        }).eq("id", producto.id);
      }
    }

    setOk("¡Pedido registrado! Te contactaremos pronto.");
    cart.clear();
    setSaving(false);
  };

  if (cart.items.length === 0 && !ok) {
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

        {ok ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{ok}</div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={styles.btn}>Volver a la tienda</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Nombre</label>
            <input
              required
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Teléfono</label>
            <input
              required
              placeholder="Tu teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Dirección</label>
            <input
              required
              placeholder="Tu dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              style={styles.input}
            />

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
