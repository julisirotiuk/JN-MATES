"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil, Trash2, Plus, LogOut, Loader2, Search,
  Home, Package, PackagePlus, ShoppingCart, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);

const MEDIOS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "transferencia_juli", label: "Transf. Juli" },
  { id: "transferencia_nacho", label: "Transf. Nacho" },
];

const emptyProducto = {
  id: null, nombre: "", categoria_id: "", precio: "", costo: "",
  stock: "", material: "", imagen_url: "", activo: true,
};

export default function AdminPanel() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState("resumen");
  const [loading, setLoading] = useState(true);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [gastos, setGastos] = useState([]);

  // ----- Gate de sesión -----
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }
      setCheckingSession(false);
    })();
  }, [router]);

  const cargarTodo = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }, { data: v }, { data: c }, { data: g }] = await Promise.all([
      supabase.from("productos").select("*").order("nombre", { ascending: true }),
      supabase.from("categorias").select("*").order("nombre", { ascending: true }),
      supabase.from("ventas").select("*").order("fecha", { ascending: false }).order("created_at", { ascending: false }).limit(200),
      supabase.from("compras").select("*").order("fecha", { ascending: false }).limit(200),
      supabase.from("gastos").select("*").order("fecha", { ascending: false }).limit(200),
    ]);
    setProductos(prods || []);
    setCategorias(cats || []);
    setVentas(v || []);
    setCompras(c || []);
    setGastos(g || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!checkingSession) cargarTodo();
  }, [checkingSession]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (checkingSession) {
    return (
      <div style={styles.centerFull}>
        <Loader2 size={26} className="jn-spin-admin" color="#a9b8a9" />
        <style>{`@keyframes jn-spin-admin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.logoRow}>
            <img src="/logo.png" alt="JN Mates" style={styles.logoImg} />
            <div>
              <div style={styles.logo}>JN Mates</div>
              <div style={styles.subtitle}>Panel privado</div>
            </div>
          </div>
          <button onClick={cerrarSesion} style={styles.logoutBtn}>
            <LogOut size={16} /> Salir
          </button>
        </header>

        {loading ? (
          <div style={styles.centerFull}><Loader2 size={26} color="#a9b8a9" /></div>
        ) : tab === "resumen" ? (
          <TabResumen productos={productos} ventas={ventas} compras={compras} gastos={gastos} />
        ) : tab === "stock" ? (
          <TabStock productos={productos} categorias={categorias} onRefresh={cargarTodo} />
        ) : tab === "comprar" ? (
          <TabComprar productos={productos} onRefresh={cargarTodo} />
        ) : (
          <TabVender productos={productos} onRefresh={cargarTodo} />
        )}
      </div>

      <nav style={styles.navBar}>
        <NavBtn icon={Home} label="Resumen" active={tab === "resumen"} onClick={() => setTab("resumen")} />
        <NavBtn icon={Package} label="Stock" active={tab === "stock"} onClick={() => setTab("stock")} />
        <NavBtn icon={PackagePlus} label="Comprar" active={tab === "comprar"} onClick={() => setTab("comprar")} />
        <NavBtn icon={ShoppingCart} label="Vender" active={tab === "vender"} onClick={() => setTab("vender")} />
      </nav>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={styles.navBtn(active)}>
      <Icon size={20} />
      <span style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}

// ============================================================
// RESUMEN
// ============================================================
function TabResumen({ productos, ventas, compras, gastos }) {
  const invertido = productos.reduce((s, p) => s + Number(p.costo || 0) * Number(p.stock || 0), 0);
  const valorVenta = productos.reduce((s, p) => s + Number(p.precio || 0) * Number(p.stock || 0), 0);
  const gananciaPotencial = valorVenta - invertido;
  const unidades = productos.reduce((s, p) => s + Number(p.stock || 0), 0);

  const stockBajo = productos.filter((p) => Number(p.stock || 0) <= 2 && p.activo);

  const caja = useMemo(() => {
    const base = {};
    MEDIOS.forEach((m) => (base[m.id] = { entra: 0, sale: 0 }));
    ventas.forEach((v) => {
      if (base[v.medio_pago]) base[v.medio_pago].entra += Number(v.precio_unitario) * Number(v.cantidad);
    });
    compras.forEach((c) => {
      if (base[c.medio_pago]) base[c.medio_pago].sale += Number(c.costo_unitario) * Number(c.cantidad);
    });
    gastos.forEach((g) => {
      if (base[g.medio_pago]) base[g.medio_pago].sale += Number(g.monto);
    });
    return base;
  }, [ventas, compras, gastos]);

  const totalVendidoHistorico = ventas.reduce((s, v) => s + Number(v.precio_unitario) * Number(v.cantidad), 0);
  const totalCompradoHistorico = compras.reduce((s, c) => s + Number(c.costo_unitario) * Number(c.cantidad), 0);
  const totalGastadoHistorico = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const gananciaReal = totalVendidoHistorico - totalCompradoHistorico - totalGastadoHistorico;

  return (
    <div>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardLabelWarn}>Invertido</div>
          <div style={styles.cardValue}>{money(invertido)}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabelOk}>Valor a la venta</div>
          <div style={styles.cardValue}>{money(valorVenta)}</div>
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={styles.cardLabel}>Ganancia potencial (si se vende todo)</div>
            <div style={styles.smallMuted}>{unidades} unidades en {productos.length} productos</div>
          </div>
          <div style={{ ...styles.cardValue, color: "#7ba15a" }}>{money(gananciaPotencial)}</div>
        </div>
      </div>

      {stockBajo.length > 0 && (
        <div style={{ ...styles.card, marginTop: 10, borderColor: "#7a5a33" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#d9924b", fontWeight: 700, fontSize: 13.5 }}>
            <AlertTriangle size={16} /> Stock bajo (2 o menos)
          </div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            {stockBajo.map((p) => (
              <div key={p.id} style={styles.smallMuted}>{p.nombre} — quedan {p.stock}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 22, marginBottom: 8, color: "#f0ece0", fontWeight: 700, fontSize: 15 }}>
        Control de caja (histórico)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MEDIOS.map((m) => {
          const c = caja[m.id];
          const saldo = c.entra - c.sale;
          return (
            <div key={m.id} style={styles.row}>
              <div style={{ flex: 1 }}>
                <div style={styles.rowName}>{m.label}</div>
                <div style={styles.rowMeta}>Vendido {money(c.entra)} · Gastado/comprado {money(c.sale)}</div>
              </div>
              <div style={{ fontWeight: 700, color: saldo >= 0 ? "#7ba15a" : "#e08a7d" }}>
                {money(saldo)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.smallMuted}>
        Esto es lo que el sistema calcula que deberías tener en cada medio, según lo cargado. Comparalo con la plata real para ver si coincide.
      </div>

      <div style={{ ...styles.card, marginTop: 18 }}>
        <div style={styles.cardLabel}>Ganancia real (histórico)</div>
        <div style={styles.smallMuted}>Vendido {money(totalVendidoHistorico)} − Comprado {money(totalCompradoHistorico)} − Gastos {money(totalGastadoHistorico)}</div>
        <div style={{ ...styles.cardValue, color: gananciaReal >= 0 ? "#7ba15a" : "#e08a7d", marginTop: 6 }}>
          {money(gananciaReal)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STOCK
// ============================================================
function TabStock({ productos, categorias, onRefresh }) {
  const [busqueda, setBusqueda] = useState("");
  const [cat, setCat] = useState("Todas");
  const [form, setForm] = useState(emptyProducto);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const nombresCat = ["Todas", ...categorias.map((c) => c.nombre)];

  const filtrados = productos.filter((p) => {
    const okCat = cat === "Todas" || categorias.find((c) => c.id === p.categoria_id)?.nombre === cat;
    const okBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return okCat && okBusq;
  });

  const unidadesTotal = filtrados.reduce((s, p) => s + Number(p.stock || 0), 0);

  const abrirNuevo = () => { setForm(emptyProducto); setShowForm(true); };
  const abrirEditar = (p) => {
    setForm({
      id: p.id, nombre: p.nombre || "", categoria_id: p.categoria_id || "",
      precio: p.precio ?? "", costo: p.costo ?? "", stock: p.stock ?? "",
      material: p.material || "", imagen_url: p.imagen_url || "", activo: p.activo,
    });
    setShowForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nombre: form.nombre, categoria_id: form.categoria_id || null,
      precio: Number(form.precio) || 0, costo: Number(form.costo) || 0,
      stock: Number(form.stock) || 0, material: form.material,
      imagen_url: form.imagen_url, activo: form.activo,
    };
    if (form.id) await supabase.from("productos").update(payload).eq("id", form.id);
    else await supabase.from("productos").insert(payload);
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const borrar = async (p) => {
    if (!confirm(`¿Borrar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("productos").delete().eq("id", p.id);
    onRefresh();
  };

  return (
    <div>
      <div style={styles.searchBox}>
        <Search size={16} color="#8fa085" />
        <input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.catScroll}>
        {nombresCat.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={styles.chip(cat === c)}>{c}</button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 12px" }}>
        <div style={styles.smallMuted}>{unidadesTotal} unidades en total</div>
        <button onClick={abrirNuevo} style={styles.addBtn}>
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ color: "#8fa085", textAlign: "center", padding: "40px 0" }}>
          No encontré productos con ese nombre.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtrados.map((p) => (
            <div key={p.id} style={styles.row}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.rowName}>
                  {p.nombre} {!p.activo && <span style={styles.badgeOff}>oculto</span>}
                </div>
                <div style={styles.rowMeta}>
                  <b style={{ color: "#d9b968" }}>{money(p.precio)}</b> · Costo {money(p.costo)} · Stock {p.stock}
                </div>
              </div>
              <div style={styles.rowActions}>
                <button onClick={() => abrirEditar(p)} style={styles.iconBtn}><Pencil size={16} /></button>
                <button onClick={() => borrar(p)} style={styles.iconBtnDanger}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <form style={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={guardar}>
            <div style={styles.modalTitle}>{form.id ? "Editar producto" : "Nuevo producto"}</div>

            <label style={styles.label}>Nombre</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={styles.input} />

            <label style={styles.label}>Categoría</label>
            <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} style={styles.input}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Precio de venta</label>
                <input type="number" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Costo</label>
                <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} style={styles.input} />
              </div>
            </div>

            <label style={styles.label}>Stock</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={styles.input} />

            <label style={styles.label}>Material</label>
            <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} style={styles.input} />

            <label style={styles.label}>URL de imagen</label>
            <input value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} style={styles.input} />

            <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              Visible en la tienda
            </label>

            <div style={styles.modalActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancelar</button>
              <button type="submit" disabled={saving} style={styles.saveBtn}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPRAR (reponer stock, o cargar un gasto particular)
// ============================================================
function TabComprar({ productos, onRefresh }) {
  const [modo, setModo] = useState("stock"); // 'stock' | 'gasto'
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [medioPago, setMedioPago] = useState("efectivo");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");

  const registrar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setOk("");

    if (modo === "stock") {
      const producto = productos.find((p) => String(p.id) === String(productoId));
      if (!producto) { setSaving(false); return; }
      const cant = Number(cantidad) || 0;
      const costo = Number(costoUnitario) || 0;

      await supabase.from("compras").insert({
        producto_id: producto.id, producto_nombre: producto.nombre,
        cantidad: cant, costo_unitario: costo, medio_pago: medioPago, fecha,
      });
      await supabase.from("productos").update({
        stock: Number(producto.stock || 0) + cant,
        costo: costo,
      }).eq("id", producto.id);

      setOk(`Se sumaron ${cant} unidades de "${producto.nombre}" al stock.`);
      setProductoId(""); setCantidad(""); setCostoUnitario("");
    } else {
      await supabase.from("gastos").insert({
        descripcion, monto: Number(monto) || 0, medio_pago: medioPago, fecha,
      });
      setOk("Gasto registrado.");
      setDescripcion(""); setMonto("");
    }

    setSaving(false);
    onRefresh();
  };

  return (
    <div>
      <div style={styles.toggleRow}>
        <button onClick={() => setModo("stock")} style={styles.toggleBtn(modo === "stock")}>Compra de stock</button>
        <button onClick={() => setModo("gasto")} style={styles.toggleBtn(modo === "gasto")}>Gasto particular</button>
      </div>

      <form onSubmit={registrar} style={styles.card}>
        {modo === "stock" ? (
          <>
            <label style={styles.label}>Producto</label>
            <select required value={productoId} onChange={(e) => setProductoId(e.target.value)} style={styles.input}>
              <option value="">Elegí un producto...</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Cantidad comprada</label>
                <input type="number" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Costo unitario</label>
                <input type="number" step="0.01" required value={costoUnitario} onChange={(e) => setCostoUnitario(e.target.value)} style={styles.input} />
              </div>
            </div>
          </>
        ) : (
          <>
            <label style={styles.label}>Descripción</label>
            <input required placeholder="Ej: bolsas, envío, insumos..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={styles.input} />
            <label style={styles.label}>Monto</label>
            <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} style={styles.input} />
          </>
        )}

        <label style={styles.label}>Pagado con</label>
        <div style={styles.toggleRow}>
          {MEDIOS.map((m) => (
            <button type="button" key={m.id} onClick={() => setMedioPago(m.id)} style={styles.toggleBtn(medioPago === m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <label style={styles.label}>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={styles.input} />

        {ok && <div style={styles.okMsg}>{ok}</div>}

        <button type="submit" disabled={saving} style={{ ...styles.saveBtn, marginTop: 16 }}>
          {saving ? "Guardando..." : modo === "stock" ? "Registrar compra" : "Registrar gasto"}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// VENDER
// ============================================================
function TabVender({ productos, onRefresh }) {
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [comprador, setComprador] = useState("");
  const [medioPago, setMedioPago] = useState("efectivo");
  const [tipoVenta, setTipoVenta] = useState("persona"); // 'web' | 'persona'
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");

  const producto = productos.find((p) => String(p.id) === String(productoId));

  const registrar = async (e) => {
    e.preventDefault();
    if (!producto) return;
    const cant = Number(cantidad) || 0;
    if (cant > Number(producto.stock || 0)) {
      alert(`Solo quedan ${producto.stock} unidades de "${producto.nombre}".`);
      return;
    }
    setSaving(true);

    await supabase.from("ventas").insert({
      producto_id: producto.id, producto_nombre: producto.nombre,
      cantidad: cant, precio_unitario: producto.precio,
      comprador: comprador || null, medio_pago: medioPago,
      tipo_venta: tipoVenta, fecha,
    });
    await supabase.from("productos").update({
      stock: Number(producto.stock || 0) - cant,
    }).eq("id", producto.id);

    setOk(`Venta registrada: ${cant} × ${producto.nombre}.`);
    setProductoId(""); setCantidad(""); setComprador("");
    setSaving(false);
    onRefresh();
  };

  return (
    <div style={styles.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f0ece0", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
        <ShoppingCart size={17} color="#d9924b" /> Registrar venta
      </div>

      <form onSubmit={registrar}>
        <label style={styles.label}>Producto</label>
        <select required value={productoId} onChange={(e) => setProductoId(e.target.value)} style={styles.input}>
          <option value="">Elegí un producto...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
          ))}
        </select>

        <label style={styles.label}>Cantidad vendida</label>
        <input type="number" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={styles.input} />

        <label style={styles.label}>Comprador (opcional)</label>
        <input placeholder="Nombre o alias" value={comprador} onChange={(e) => setComprador(e.target.value)} style={styles.input} />

        <label style={styles.label}>Tipo de venta</label>
        <div style={styles.toggleRow}>
          <button type="button" onClick={() => setTipoVenta("web")} style={styles.toggleBtn(tipoVenta === "web")}>Por la web</button>
          <button type="button" onClick={() => setTipoVenta("persona")} style={styles.toggleBtn(tipoVenta === "persona")}>En persona</button>
        </div>

        <label style={styles.label}>Cobrado con</label>
        <div style={styles.toggleRow}>
          {MEDIOS.map((m) => (
            <button type="button" key={m.id} onClick={() => setMedioPago(m.id)} style={styles.toggleBtn(medioPago === m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <label style={styles.label}>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={styles.input} />

        {ok && <div style={styles.okMsg}>{ok}</div>}

        <button type="submit" disabled={saving} style={{ ...styles.dangerBtn, marginTop: 16 }}>
          {saving ? "Guardando..." : "Registrar venta"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "#131c15", fontFamily: "Inter, system-ui, sans-serif", paddingBottom: 78 },
  shell: { maxWidth: 640, margin: "0 auto", padding: "18px 16px 30px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoImg: { width: 38, height: 38, borderRadius: 8, objectFit: "cover" },
  logo: { color: "#f0ece0", fontSize: 19, fontWeight: 700, fontFamily: "Georgia, serif" },
  subtitle: { color: "#8fa085", fontSize: 11.5 },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "#1f2c22", color: "#8fa085",
    border: "1px solid #33422f", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer",
  },
  centerFull: { display: "flex", justifyContent: "center", padding: 60 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  card: { background: "#1f2c22", border: "1px solid #33422f", borderRadius: 12, padding: 16 },
  cardLabel: { color: "#8fa085", fontSize: 12.5 },
  cardLabelWarn: { color: "#d9924b", fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 },
  cardLabelOk: { color: "#7ba15a", fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 },
  cardValue: { color: "#f0ece0", fontSize: 22, fontWeight: 700, marginTop: 4 },
  smallMuted: { color: "#8fa085", fontSize: 12, marginTop: 4 },
  searchBox: {
    display: "flex", alignItems: "center", gap: 8, background: "#1f2c22", border: "1px solid #33422f",
    borderRadius: 10, padding: "10px 12px", marginBottom: 10,
  },
  searchInput: { background: "none", border: "none", outline: "none", color: "#f0ece0", fontSize: 14, flex: 1 },
  catScroll: { display: "flex", gap: 8, overflowX: "auto", padding: "2px 0" },
  chip: (active) => ({
    flexShrink: 0, padding: "7px 14px", fontSize: 12.5, borderRadius: 999, cursor: "pointer",
    background: active ? "#4c5f2e" : "#1f2c22", color: active ? "#f0ece0" : "#8fa085",
    border: active ? "1px solid #7ba15a" : "1px solid #33422f",
  }),
  addBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "#4c8a3f", color: "#f0ece0",
    border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  row: {
    display: "flex", alignItems: "center", gap: 10, background: "#1f2c22",
    border: "1px solid #33422f", borderRadius: 10, padding: "12px 14px",
  },
  rowName: { color: "#f0ece0", fontWeight: 600, fontSize: 14 },
  rowMeta: { color: "#8fa085", fontSize: 12, marginTop: 2 },
  badgeOff: { fontSize: 10, color: "#e08a7d", border: "1px solid #e08a7d", borderRadius: 6, padding: "1px 5px", marginLeft: 6 },
  rowActions: { display: "flex", gap: 6, flexShrink: 0 },
  iconBtn: {
    background: "#2a3a26", color: "#f0ece0", border: "none", borderRadius: 8,
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  iconBtnDanger: {
    background: "#3a2626", color: "#e08a7d", border: "none", borderRadius: 8,
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16,
  },
  modal: {
    width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto",
    background: "#16201a", border: "1px solid #33422f", borderRadius: 14, padding: 20,
    display: "flex", flexDirection: "column",
  },
  modalTitle: { color: "#f0ece0", fontSize: 17, fontWeight: 700, marginBottom: 10 },
  label: { color: "#8fa085", fontSize: 12, marginTop: 10, marginBottom: 4, display: "block" },
  input: {
    background: "#16201a", border: "1px solid #33422f", borderRadius: 8, padding: "9px 11px",
    color: "#f0ece0", fontSize: 14, outline: "none", width: "100%",
  },
  modalActions: { display: "flex", gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1, background: "#1f2c22", color: "#8fa085", border: "1px solid #33422f",
    borderRadius: 10, padding: "11px", fontSize: 14, cursor: "pointer",
  },
  saveBtn: {
    width: "100%", background: "#4c8a3f", color: "#f0ece0", border: "none",
    borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  dangerBtn: {
    width: "100%", background: "#b0503f", color: "#f0ece0", border: "none",
    borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  toggleRow: { display: "flex", gap: 8, margin: "8px 0 4px" },
  toggleBtn: (active) => ({
    flex: 1, padding: "10px 8px", fontSize: 12.5, borderRadius: 9, cursor: "pointer", fontWeight: 600,
    background: active ? "#4c5f2e" : "#1f2c22", color: active ? "#f0ece0" : "#8fa085",
    border: active ? "1px solid #7ba15a" : "1px solid #33422f",
  }),
  okMsg: { color: "#7ba15a", fontSize: 12.5, marginTop: 10 },
  navBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, background: "#16201a",
    borderTop: "1px solid #33422f", display: "flex", justifyContent: "space-around",
    padding: "8px 0", zIndex: 40,
  },
  navBtn: (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    background: "none", border: "none", cursor: "pointer",
    color: active ? "#d9924b" : "#8fa085",
  }),
};
