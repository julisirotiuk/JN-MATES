"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Plus, Minus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function Tienda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Todas");
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("productos_publicos")
        .select("*")
        .order("nombre", { ascending: true });
      setProductos(data || []);
      setLoading(false);
    })();
  }, []);

  const categorias = useMemo(() => {
    const nombres = new Set(productos.map((p) => p.categoria_nombre).filter(Boolean));
    return ["Todas", ...Array.from(nombres).sort()];
  }, [productos]);

  const filtrados = useMemo(
    () => (cat === "Todas" ? productos : productos.filter((p) => p.categoria_nombre === cat)),
    [productos, cat]
  );

  return (
    <div style={styles.appBg}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .jn-root { font-family: 'Inter', system-ui, sans-serif; color: #f0ece0; }
        .jn-serif { font-family: 'Fraunces', serif; }
        .jn-btn { border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform .08s ease; }
        .jn-btn:active { transform: scale(0.96); }
        .jn-spin { animation: jn-spin 0.8s linear infinite; }
        @keyframes jn-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="jn-root" style={styles.shell}>
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="JN Mates" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
            <div className="jn-serif" style={styles.logo}>JN Mates</div>
          </div>
          <button className="jn-btn" style={styles.cartBtn} onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} />
            {cart.cantidadTotal > 0 && <span style={styles.cartBadge}>{cart.cantidadTotal}</span>}
          </button>
        </header>

        <div style={styles.catScroll}>
          {categorias.map((c) => (
            <button
              key={c}
              className="jn-btn"
              style={styles.chip(cat === c)}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <main style={styles.grid}>
          {loading ? (
            <div style={styles.centerLoading}>
              <Loader2 size={26} className="jn-spin" color="#a9b8a9" />
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ color: "#8fa085", textAlign: "center", padding: 40 }}>
              No hay productos en esta categoría por ahora.
            </div>
          ) : (
            filtrados.map((p) => (
              <div key={p.id} style={styles.card}>
                <div style={styles.cardImg}>
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} style={styles.img} />
                  ) : (
                    <span style={{ fontSize: 26, opacity: 0.35 }}>🧉</span>
                  )}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={styles.cardName}>{p.nombre}</div>
                  {p.material && <div style={styles.cardMeta}>{p.material}</div>}
                  <div style={styles.cardBottom}>
                    <span className="jn-serif" style={styles.cardPrice}>{money(p.precio)}</span>
                    {p.stock <= 0 ? (
                      <span style={styles.soldOut}>Sin stock</span>
                    ) : (
                      <button
                        className="jn-btn"
                        style={styles.addBtn}
                        onClick={() => cart.addItem(p, 1)}
                      >
                        <Plus size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {cartOpen && (
        <div style={styles.overlay} onClick={() => setCartOpen(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <span className="jn-serif" style={{ fontSize: 19, fontWeight: 700 }}>Tu carrito</span>
              <button className="jn-btn" style={styles.iconBtn} onClick={() => setCartOpen(false)}>
                <X size={19} />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div style={{ color: "#8fa085", padding: "30px 0", textAlign: "center" }}>
                Todavía no agregaste nada.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
                {cart.items.map((i) => (
                  <div key={i.id} style={styles.cartRow}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={styles.cardName}>{i.nombre}</div>
                      <div style={styles.cardMeta}>{money(i.precio)} c/u</div>
                    </div>
                    <div style={styles.stepper}>
                      <button className="jn-btn" style={styles.stepBtn} onClick={() => cart.setCantidad(i.id, i.cantidad - 1)}>
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700 }}>{i.cantidad}</span>
                      <button className="jn-btn" style={styles.stepBtn} onClick={() => cart.setCantidad(i.id, i.cantidad + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.items.length > 0 && (
              <div style={styles.drawerFooter}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                  <span style={{ color: "#8fa085" }}>Total</span>
                  <span className="jn-serif" style={{ fontWeight: 700, fontSize: 19 }}>{money(cart.total)}</span>
                </div>
                <Link href="/checkout" style={{ textDecoration: "none" }}>
                  <button className="jn-btn" style={styles.checkoutBtn}>Finalizar pedido</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appBg: { minHeight: "100vh", background: "#131c15" },
  shell: { maxWidth: 720, margin: "0 auto", padding: "0 16px 40px" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "22px 2px 10px",
  },
  logo: { fontSize: 26, fontWeight: 700 },
  cartBtn: {
    position: "relative", background: "#1f2c22", border: "1px solid #33422f",
    color: "#f0ece0", borderRadius: 10, padding: "9px 11px", display: "flex",
  },
  cartBadge: {
    position: "absolute", top: -6, right: -6, background: "#d9924b", color: "#16201a",
    fontSize: 10.5, fontWeight: 800, borderRadius: 999, minWidth: 17, height: 17,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
  },
  catScroll: { display: "flex", gap: 8, overflowX: "auto", padding: "2px 2px 14px" },
  chip: (active) => ({
    flexShrink: 0, padding: "8px 16px", fontSize: 13, borderRadius: 999,
    background: active ? "#4c5f2e" : "#1f2c22", color: active ? "#f0ece0" : "#8fa085",
    border: active ? "1px solid #7ba15a" : "1px solid #33422f",
  }),
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 12,
  },
  centerLoading: { gridColumn: "1/-1", display: "flex", justifyContent: "center", padding: 50 },
  card: { background: "#1f2c22", border: "1px solid #33422f", borderRadius: 14, overflow: "hidden" },
  cardImg: {
    aspectRatio: "1", background: "#182119", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  cardName: {
    fontSize: 13.5, fontWeight: 600, color: "#f0ece0", lineHeight: 1.25,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  cardMeta: { fontSize: 11.5, color: "#8fa085", marginTop: 2, textTransform: "capitalize" },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  cardPrice: { fontSize: 15, fontWeight: 700, color: "#d9b968" },
  addBtn: { background: "#4c8a3f", color: "#f0ece0", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  soldOut: { fontSize: 11, color: "#e08a7d", fontWeight: 600 },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
    justifyContent: "flex-end", zIndex: 50,
  },
  drawer: {
    width: "100%", maxWidth: 380, height: "100%", background: "#16201a",
    borderLeft: "1px solid #33422f", padding: 18, display: "flex", flexDirection: "column",
  },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  iconBtn: { background: "none", color: "#8fa085", padding: 4 },
  cartRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#1f2c22", border: "1px solid #33422f", borderRadius: 10, padding: "10px 12px", gap: 8,
  },
  stepper: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  stepBtn: { width: 26, height: 26, borderRadius: 7, background: "#2a3a26", color: "#f0ece0", display: "flex", alignItems: "center", justifyContent: "center" },
  drawerFooter: { marginTop: "auto", paddingTop: 14, borderTop: "1px solid #33422f", display: "flex", flexDirection: "column", gap: 12 },
  checkoutBtn: { background: "#4c8a3f", color: "#f0ece0", padding: "13px", fontSize: 15 },
};
