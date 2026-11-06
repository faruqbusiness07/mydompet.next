"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Sidebar from "../components/Sidebar";
import AddGoalModal from "../components/AddGoalModal";
import AddSavingsTransactionModal from "../components/AddSavingsTransactionModal";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export default function TabunganPage() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        router.replace("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      // Ambil goals dan transactions secara paralel
      const [goalsRes, txRes] = await Promise.all([
        supabase.from("savings_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("savings_transactions")
          .select("id, amount, transaction_date, goal_id, savings_goals(title)")
          .eq("user_id", userId)
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (txRes.data) setTransactions(txRes.data);
      setLoading(false);
    }

    loadData();
  }, [router]);

  // Hitung total keseluruhan tabungan dari semua target
  const totalSavings = goals.reduce((acc, curr) => acc + Number(curr.current_amount || 0), 0);

  function handleGoalSaved(newGoal) {
    setGoals((prev) => [...prev, newGoal]);
    showToast("Target tabungan berhasil ditambahkan.");
  }

  function handleTxSaved(newTx, updatedCurrentAmount) {
    setGoals((prev) =>
      prev.map((g) => (g.id === newTx.goal_id ? { ...g, current_amount: updatedCurrentAmount } : g))
    );
    setTransactions((prev) => [newTx, ...prev]);
    showToast("Setoran tabungan berhasil dicatat.");
  }

  return (
    <main className="dashboard" style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <section className="content" style={{ flex: 1, padding: "32px" }}>
        <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <p className="eyebrow" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" }}>PENGELOLAAN KEUANGAN</p>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1e293b" }}>Tabungan</h1>
            <p className="subtitle" style={{ color: "#64748b", fontSize: "0.95rem" }}>Kelola target dan pantau kemajuan tabunganmu.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowTxModal(true)}
            style={{
              background: "#3b82f6",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 10,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            + Input Setoran
          </button>
        </header>

        {/* Layout Utama Grid: Kiri untuk Card & Target, Kanan untuk Riwayat */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          
          {/* Kolom Kiri */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Card 1: Total Tabungan */}
            <div style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Tabungan</p>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginTop: 8 }}>{formatRupiah(totalSavings)}</h2>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: 4 }}>Akumulasi dari semua target tabungan aktif</p>
            </div>

            {/* Grid Target Tabungan & Tombol Tambah (+) */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>Target Kategori Tabungan</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                
                {/* List Target Existing */}
                {goals.map((goal) => (
                  <div key={goal.id} style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Tabungan</p>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "4px 0 12px 0" }}>{goal.title}</h4>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2563eb" }}>{formatRupiah(goal.current_amount)}</p>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>Target: {formatRupiah(goal.target_amount)}</p>
                  </div>
                ))}

                {/* Card Tombol Plus (+) untuk Tambah Target Baru */}
                <div
                  onClick={() => setShowGoalModal(true)}
                  style={{
                    background: "#f1f5f9",
                    border: "2px dashed #cbd5e1",
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 130,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                >
                  <span style={{ fontSize: "2rem", fontWeight: 300, color: "#64748b" }}>+</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginTop: 4 }}>Tambah Target</span>
                </div>

              </div>
            </div>

          </div>

          {/* Kolom Kanan: Riwayat Tabungan */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", height: "fit-content" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>Riwayat Tabungan</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {loading ? (
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Memuat riwayat...</p>
              ) : transactions.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Belum ada setoran tabungan.</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.9rem", color: "#10b981" }}>+{formatRupiah(tx.amount)}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{formatDate(tx.transaction_date)}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#475569", marginTop: 4 }}>
                      Untuk: <strong>{tx.savings_goals?.title || "Target"}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Modal Tambah Target Kategori */}
      <AddGoalModal open={showGoalModal} onClose={() => setShowGoalModal(false)} onSaved={handleGoalSaved} />

      {/* Modal Input Setoran Tabungan */}
      <AddSavingsTransactionModal open={showTxModal} goals={goals} onClose={() => setShowTxModal(false)} onSaved={handleTxSaved} />

      {toast && <div className="fp-toast" role="status">{toast}</div>}
    </main>
  );
}