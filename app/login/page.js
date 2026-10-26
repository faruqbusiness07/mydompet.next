
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }

        setMessage(
          "Registrasi berhasil. Jika konfirmasi email diwajibkan, buka email kamu untuk mengaktifkan akun."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.replace("/");
        router.refresh();
        return;
      }
    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f4f5f7",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 32,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>
          My<span style={{ color: "#10b981" }}>Dompet</span>
        </h1>

        <p style={{ color: "#6b7280" }}>
          {mode === "login"
            ? "Masuk untuk mengelola keuanganmu."
            : "Buat akun untuk mulai mencatat keuanganmu."}
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: 8 }}
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            required
            style={inputStyle}
          />

          <label
            htmlFor="password"
            style={{ display: "block", margin: "16px 0 8px" }}
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimal 6 karakter"
            minLength={6}
            required
            style={inputStyle}
          />

          {message && (
            <p
              role="status"
              style={{
                color: message.includes("berhasil") ? "#047857" : "#b91c1c",
                fontSize: 14,
                lineHeight: 1.6,
                marginTop: 16,
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 22,
              padding: 13,
              border: 0,
              borderRadius: 10,
              background: "#87e64b",
              color: "#111827",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "Memproses..."
              : mode === "login"
                ? "Masuk"
                : "Daftar"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            marginBottom: 0,
            marginTop: 22,
          }}
        >
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
            }}
            style={{
              border: 0,
              background: "none",
              color: "#047857",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {mode === "login" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </section>
    </main>
  );
}

const inputStyle = {
  boxSizing: "border-box",
  width: "100%",
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
};
