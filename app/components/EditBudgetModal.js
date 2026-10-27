"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function EditBudgetModal({ open, currentBudget, month, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(currentBudget ? currentBudget.toString() : "");
      setError("");
    }
  }, [open, currentBudget]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Sesi pengguna tidak valid.");

      const userId = userData.user.id;
      const numericAmount = Number(amount) || 0;

      // Cek apakah data budget untuk bulan ini sudah ada
      const { data: existing, error: checkError } = await supabase
        .from("monthly_budgets")
        .select("id")
        .eq("user_id", userId)
        .eq("month", month)
        .maybeSingle();

      if (checkError) throw checkError;

      let saveError;
      if (existing) {
        // Update jika sudah ada
        const { error: updateError } = await supabase
          .from("monthly_budgets")
          .update({ budget_amount: numericAmount, updated_at: new Date() })
          .eq("id", existing.id);
        saveError = updateError;
      } else {
        // Insert jika belum ada
        const { error: insertError } = await supabase
          .from("monthly_budgets")
          .insert([{ user_id: userId, month: month, budget_amount: numericAmount }]);
        saveError = insertError;
      }

      if (saveError) throw saveError;

      onSaved(numericAmount);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.55)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Atur Anggaran Bulanan</h2>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Masukkan batas maksimal pengeluaran untuk bulan ini.
        </p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 10, borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#374151" }}>
              Nominal Anggaran (Rp)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 500000"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                fontSize: "1rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              style={{
                flex: 1,
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 10,
                background: "#fff",
                color: "#374151",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: 12,
                border: 0,
                borderRadius: 10,
                background: "#10b981",
                color: "#fff",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}