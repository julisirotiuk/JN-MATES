"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingBag, Plus, Minus, X, Loader2, Sparkles, MoreVertical, Home, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";

const WHATSAPP_CONTACTS = [
  { id: "nacho", label: "Nacho", number: "5492625669387" },
  { id: "juli", label: "Juli", number: "5492625595973" },
];

function WhatsAppButton({ producto }) {
  const [open, setOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
        setShowContacts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mensaje = `Hola! Necesito atención personalizada sobre este producto: ${producto.nombre}\n\n${producto.imagen_url || ""}`;
  const mensajeGenerico = `Hola! Necesito realizar una consulta acerca de este producto\n\n${producto.imagen_url || ""}`;

  return (
    <div ref={btnRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={styles.whatsappBtn}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Opciones</span>
      </button>
      {open && !showContacts && (
        <div style={styles.whatsappMenu}>
          <button
            onClick={() => setShowContacts(true)}
            style={styles.whatsappMenuItem}
          >
            <div style={styles.contactAvatar}>N</div>
            <span style={{ flex: 1 }}>Necesito atención personalizada</span>
            <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
          </button>
          <a
            href={`https://wa.me/5492625669387?text=${encodeURIComponent(mensajeGenerico)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.whatsappMenuItem}
            onClick={(e) => { e.preventDefault(); setOpen(false); window.open(`https://wa.me/5492625669387?text=${encodeURIComponent(mensajeGenerico)}`, "_blank"); }}
          >
            <div style={styles.contactAvatar}>?</div>
            <span style={{ flex: 1 }}>Otra consulta...</span>
          </a>
        </div>
      )}
      {open && showContacts && (
        <div style={styles.whatsappMenu}>
          <button
            onClick={() => setShowContacts(false)}
            style={{ ...styles.whatsappMenuItem, color: "#8fa085" }}
          >
            ← Volver
          </button>
          {WHATSAPP_CONTACTS.map((c) => (
            <a
              key={c.id}
              href={`https://wa.me/${c.number}?text=${encodeURIComponent(mensaje)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappMenuItem}
              onClick={(e) => { e.preventDefault(); setOpen(false); window.open(`https://wa.me/${c.number}?text=${encodeURIComponent(mensaje)}`, "_blank"); }}
            >
              <div style={styles.contactAvatar}>{c.label[0]}</div>
              <span style={{ flex: 1 }}>{c.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

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
        .jn-hero-anim { animation: jn-hero-fade 0.8s ease-out both; }
        .jn-hero-anim-delay { animation: jn-hero-fade 0.8s ease-out 0.2s both; }
        .jn-product-anim { animation: jn-product-fade 0.5s ease-out both; }
        @keyframes jn-hero-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes jn-product-fade {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
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
            <h1 className="jn-display jn-hero-anim" style={styles.heroTitle}>
              Mates únicos,<br />
              <span style={styles.heroHighlight}>experiencias reales</span>
            </h1>
            <p className="jn-hero-anim-delay" style={styles.heroDesc}>
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
            filtrados.map((p, index) => (
              <div key={p.id} className="jn-card jn-product-anim" style={{ ...styles.card, animationDelay: `${Math.min(index * 0.08, 0.6)}s` }}>
                <div style={styles.cardImg}>
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      style={{
                        ...styles.img,
                        objectFit: "cover",
                        transform: `scale(${p.imagen_zoom || 1}) translate(${(p.imagen_pos_x || 0) / (p.imagen_zoom || 1)}px, ${(p.imagen_pos_y || 0) / (p.imagen_zoom || 1)}px)`,
                      }}
                    />
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
                  <WhatsAppButton producto={p} />
                </div>
              </div>
            ))
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLogo}>JN MATES</div>
          <div style={styles.footerText}>Calidad que se nota</div>
          <div style={styles.footerBadges}>
            <div style={styles.badge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Envíos a todo el país</span>
            </div>
            <a
              href="https://instagram.com/jn.matess"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.instagramLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>@jn.matess</span>
            </a>
          </div>
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
    aspectRatio: "3/4",
    background: "linear-gradient(135deg, #f0ebe3 0%, #e8e3d9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
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
  whatsappBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: "10px 14px",
    background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s ease",
    width: "100%",
    boxShadow: "0 4px 16px rgba(37, 211, 102, 0.3)",
    boxSizing: "border-box",
  },
  whatsappMenu: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    marginBottom: 6,
    background: "#fff",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: 14,
    padding: 6,
    zIndex: 100,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  },
  whatsappMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 10,
    color: "#2d2a26",
    fontSize: 13,
    fontWeight: 500,
    textDecoration: "none",
    transition: "background .15s ease",
    cursor: "pointer",
    minWidth: 0,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
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
  footerBadges: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: 999,
    color: "#2d2a26",
    fontSize: 14,
    fontWeight: 600,
  },
  instagramLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: 999,
    color: "#2d2a26",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all .2s ease",
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
