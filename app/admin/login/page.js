"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
  };

  return (
    <div style={styles.bg}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <img src="/logo.png" alt="JN Mates" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", margin: "0 auto 10px", display: "block" }} />
        <div style={styles.logo}>JN Mates</div>
        <div style={styles.subtitle}>Panel privado</div>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#131c15",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    background: "#1f2c22",
    border: "1px solid #33422f",
    borderRadius: 14,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  logo: { color: "#f0ece0", fontSize: 22, fontWeight: 700, textAlign: "center" },
  subtitle: { color: "#8fa085", fontSize: 13, textAlign: "center", marginBottom: 16 },
  label: { color: "#8fa085", fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: {
    background: "#16201a",
    border: "1px solid #33422f",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#f0ece0",
    fontSize: 14,
    outline: "none",
  },
  error: { color: "#e08a7d", fontSize: 12.5, marginTop: 10 },
  btn: {
    marginTop: 18,
    background: "#4c8a3f",
    color: "#f0ece0",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
