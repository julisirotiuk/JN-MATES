"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingBag, Plus, Minus, X, Loader2, Sparkles, MoreVertical, Home } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categorias = useMemo(() => {
    const nombres = new Set(productos.map((p) => p.categoria_nombre).filter(Boolean));
    return ["Todas", ...Array.from(nombres).sort()];
  }, [productos]);

  const filtrados = useMemo(
    () => (cat === "Todas" ? productos : productos.filter((p) => p.categoria_nombre === cat)),
    [productos, cat]
  );

  const irA = (c) => {
    setCat(c);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.appBg}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .jn-root { font-family: 'Outfit', system-ui, sans-serif; color: #2d2a26; }
        .jn-display { font-family: 'Space Grotesk', sans-serif; }
        .jn-btn { border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all .15s ease; }
        .jn-btn:active { transform: scale(0.95); }
        .jn-spin { animation: jn-spin 0.8s linear infinite; }
        @keyframes jn-spin { to { transform: rotate(360deg); } }
        .jn-card { transition: all .2s ease; }
        .jn-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        .jn-chip { transition: all .15s ease; }
        .jn-chip:hover { transform: scale(1.05); }
        .jn-menu-item { transition: all .15s ease; }
        .jn-menu-item:hover { background: rgba(76, 138, 63, 0.1); }
      `}</style>

      <div className="jn-root" style={styles.shell}>
        {/* Header */}
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.jpeg" alt="JN MATES" style={styles.logoImg} />
            <div>
              <div className="jn-display" style={styles.logoText}>JN MATES</div>
              <div style={styles.tagline}>Encontrá tu mate perfecto</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Menú de 3 puntitos */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button className="jn-btn" style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <MoreVertical size={20} />
              </button>
              {menuOpen && (
                <div style={styles.dropdown}>
                  <button className="jn-menu-item" style={styles.dropdownItem} onClick={() => irA("Todas")}>
                    <Home size={16} />
                    <span>Inicio</span>
                  </button>
                  {categorias.filter((c) => c !== "Todas").map((c) => (
                    <button key={c} className="jn-menu-item" style={styles.dropdownItem} onClick={() => irA(c)}>
                      <span style={{ width: 16, textAlign: "center", fontSize: 12 }}>•</span>
                      <span>{c}</span>
                    </button>
                  ))}
                  <button className="jn-menu-item" style={styles.dropdownItem} onClick={() => irA("Todas")}>
                    <span style={{ width: 16, textAlign: "center", fontSize: 12 }}>•</span>
                    <span>Todas</span>
                  </button>
                </div>
              )}
            </div>
            {/* Carrito */}
            <button className="jn-btn" style={styles.cartBtn} onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              {cart.cantidadTotal > 0 && <span style={styles.cartBadge}>{cart.cantidadTotal}</span>}
            </button>
          </div>
        </header>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <Sparkles size={14} /> Calidad premium
            </div>
            <h1 className="jn-display" style={styles.heroTitle}>
              Mates únicos,<br />
              <span style={styles.heroHighlight}>experiencias reales</span>
            </h1>
            <p style={styles.heroDesc}>
              Amor y dedicación en cada producto, para acompañarte en cada momento.
            </p>
          </div>
        </div>

        {/* Grid de productos */}
        <main style={styles.grid}>
          {loading ? (
            <div style={styles.centerLoading}>
              <Loader2 size={32} className="jn-spin" color="#8fa085" />
            </div>
          ) : filtrados.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧉</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No hay productos</div>
              <div style={{ fontSize: 13, color: "#8fa085" }}>En esta categoría por ahora</div>
            </div>
          ) : (
            filtrados.map((p) => (
              <div key={p.id} className="jn-card" style={styles.card}>
                <div style={styles.cardImg}>
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} style={styles.img} />
                  ) : (
                    <div style={styles.imgPlaceholder}>
                      <span style={{ fontSize: 40 }}>🧉</span>
                    </div>
                  )}
                  {p.stock <= 0 && (
                    <div style={styles.soldOutOverlay}>
                      <span style={styles.soldOutText}>AGOTADO</span>
                    </div>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardName}>{p.nombre}</div>
                  {p.material && <div style={styles.cardMeta}>{p.material}</div>}
                  <div style={styles.cardBottom}>
                    <div style={styles.priceContainer}>
                      <span className="jn-display" style={styles.cardPrice}>{money(p.precio)}</span>
                    </div>
                    {p.stock > 0 ? (
                      <button
                        className="jn-btn"
                        style={styles.addBtn}
                        onClick={() => cart.addItem(p, 1)}
                      >
                        <Plus size={16} />
                      </button>
                    ) : (
                      <span style={styles.soldOutBadge}>Sin stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLogo}>JN MATES</div>
          <div style={styles.footerText}>Calidad que se nota</div>
        </footer>
      </div>

      {/* Carrito */}
      {cartOpen && (
        <div style={styles.overlay} onClick={() => setCartOpen(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <div className="jn-display" style={styles.drawerTitle}>Tu carrito</div>
                <div style={styles.drawerSubtitle}>{cart.cantidadTotal} productos</div>
              </div>
              <button className="jn-btn" style={styles.iconBtn} onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Carrito vacío</div>
                <div style={{ fontSize: 13, color: "#8fa085" }}>Agregá productos para continuar</div>
              </div>
            ) : (
              <div style={styles.cartItems}>
                {cart.items.map((i) => (
                  <div key={i.id} style={styles.cartRow}>
                    <div style={styles.cartItemInfo}>
                      <div style={styles.cartItemName}>{i.nombre}</div>
                      <div style={styles.cartItemPrice}>{money(i.precio)} c/u</div>
                    </div>
                    <div style={styles.stepper}>
                      <button className="jn-btn" style={styles.stepBtn} onClick={() => cart.setCantidad(i.id, i.cantidad - 1)}>
                        <Minus size={14} />
                      </button>
                      <span style={styles.stepperValue}>{i.cantidad}</span>
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
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total</span>
                  <span className="jn-display" style={styles.totalValue}>{money(cart.total)}</span>
                </div>
                <Link href="/checkout" style={{ textDecoration: "none" }}>
                  <button className="jn-btn" style={styles.checkoutBtn}>
                    Finalizar pedido
                  </button>
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
  appBg: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f5f0e8 0%, #ede8dd 50%, #f5f0e8 100%)",
  },
  shell: { maxWidth: 720, margin: "0 auto", padding: "0 20px 60px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 0 16px",
  },
  logoImg: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#2d2a26",
  },
  tagline: {
    fontSize: 11,
    color: "#6b6560",
    fontWeight: 400,
    letterSpacing: "0.02em",
  },
  menuBtn: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    color: "#2d2a26",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: 14,
    padding: 8,
    minWidth: 180,
    zIndex: 100,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 14px",
    background: "none",
    border: "none",
    borderRadius: 8,
    color: "#2d2a26",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
  },
  cartBtn: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    color: "#2d2a26",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "linear-gradient(135deg, #d9924b 0%, #e8a85c 100%)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    boxShadow: "0 2px 8px rgba(217, 146, 75, 0.4)",
  },
  hero: {
    background: "linear-gradient(135deg, rgba(76, 138, 63, 0.12) 0%, rgba(123, 161, 90, 0.08) 100%)",
    borderRadius: 20,
    padding: "32px 24px",
    marginBottom: 24,
    border: "1px solid rgba(123, 161, 90, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(123, 161, 90, 0.15)",
    color: "#4c8a3f",
    fontSize: 11,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 999,
    marginBottom: 16,
    border: "1px solid rgba(123, 161, 90, 0.3)",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 12,
    letterSpacing: "-0.02em",
    color: "#2d2a26",
  },
  heroHighlight: {
    color: "#4c8a3f",
  },
  heroDesc: {
    fontSize: 14,
    color: "#6b6560",
    lineHeight: 1.5,
    maxWidth: 400,
  },
  catScroll: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    padding: "4px 0 20px",
    scrollbarWidth: "none",
  },
  chip: (active) => ({
    flexShrink: 0,
    padding: "10px 20px",
    fontSize: 13,
    borderRadius: 999,
    fontWeight: 600,
    background: active
      ? "linear-gradient(135deg, #4c8a3f 0%, #5a9a4a 100%)"
      : "rgba(255, 255, 255, 0.6)",
    color: active ? "#fff" : "#6b6560",
    border: active ? "1px solid rgba(123, 161, 90, 0.5)" : "1px solid rgba(0, 0, 0, 0.08)",
    backdropFilter: "blur(10px)",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
  },
  centerLoading: {
    gridColumn: "1/-1",
    display: "flex",
    justifyContent: "center",
    padding: 60,
  },
  emptyState: {
    gridColumn: "1/-1",
    textAlign: "center",
    padding: "60px 20px",
    color: "#8fa085",
  },
  card: {
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: 16,
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  cardImg: {
    aspectRatio: "1",
    background: "linear-gradient(135deg, #f0ebe3 0%, #e8e3d9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.4,
  },
  soldOutOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(245, 240, 232, 0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
  soldOutText: {
    color: "#c0392b",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  cardContent: {
    padding: "14px 14px 16px",
  },
  cardName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2d2a26",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: "#8fa085",
    textTransform: "capitalize",
    marginBottom: 10,
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: "#4c8a3f",
    letterSpacing: "-0.01em",
  },
  addBtn: {
    background: "linear-gradient(135deg, #4c8a3f 0%, #5a9a4a 100%)",
    color: "#fff",
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(76, 138, 63, 0.3)",
  },
  soldOutBadge: {
    fontSize: 11,
    color: "#c0392b",
    fontWeight: 600,
  },
  footer: {
    marginTop: 60,
    padding: "32px 0",
    textAlign: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
  },
  footerLogo: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginBottom: 8,
    color: "#2d2a26",
  },
  footerText: {
    fontSize: 12,
    color: "#8fa085",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 50,
    backdropFilter: "blur(4px)",
  },
  drawer: {
    width: "100%",
    maxWidth: 400,
    height: "100%",
    background: "linear-gradient(180deg, #faf8f4 0%, #f5f0e8 100%)",
    borderLeft: "1px solid rgba(0, 0, 0, 0.08)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#2d2a26",
  },
  drawerSubtitle: {
    fontSize: 12,
    color: "#8fa085",
    marginTop: 2,
  },
  iconBtn: {
    background: "rgba(255, 255, 255, 0.6)",
    color: "#6b6560",
    padding: 8,
    borderRadius: 10,
  },
  emptyCart: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#8fa085",
  },
  cartItems: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
    flex: 1,
  },
  cartRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.6)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: 12,
    padding: "12px 14px",
    gap: 12,
  },
  cartItemInfo: {
    minWidth: 0,
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2d2a26",
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: "#8fa085",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(76, 138, 63, 0.15)",
    color: "#4c8a3f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    minWidth: 20,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 14,
    color: "#2d2a26",
  },
  drawerFooter: {
    marginTop: "auto",
    paddingTop: 16,
    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#8fa085",
    fontSize: 14,
  },
  totalValue: {
    fontWeight: 700,
    fontSize: 22,
    color: "#4c8a3f",
    letterSpacing: "-0.01em",
  },
  checkoutBtn: {
    background: "linear-gradient(135deg, #4c8a3f 0%, #5a9a4a 100%)",
    color: "#fff",
    padding: "14px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(76, 138, 63, 0.3)",
  },
};
