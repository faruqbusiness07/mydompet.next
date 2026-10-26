"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export default function Home() {
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [balanceInput, setBalanceInput] = useState("0");
  const [savingBalance, setSavingBalance] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const [openingBalance, setOpeningBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleSaveBalance() {
    const amount = Number(balanceInput);

    if (
      balanceInput.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      alert("Masukkan saldo awal yang valid.");
      return;
    }

    setSavingBalance(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Sesi login tidak ditemukan. Silakan login kembali.");
        router.replace("/login");
        return;
      }

      const { error: saveError } = await supabase
        .from("wallet_settings")
        .upsert(
          {
            user_id: user.id,
            opening_balance: amount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (saveError) {
        alert("Gagal menyimpan saldo: " + saveError.message);
        return;
      }

      setOpeningBalance(amount);
      setShowBalanceDialog(false);
      alert("Saldo awal berhasil disimpan!");
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setSavingBalance(false);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        router.replace("/login");
        return;
      }

      const month = getCurrentMonth();
      const today = new Date();
      const year = today.getFullYear();
      const monthNumber = String(today.getMonth() + 1).padStart(2, "0");
      const firstDay = `${year}-${monthNumber}-01`;

      const nextMonthDate = new Date(year, today.getMonth() + 1, 1);
      const nextMonthYear = nextMonthDate.getFullYear();
      const nextMonthNumber = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
      const nextMonth = `${nextMonthYear}-${nextMonthNumber}-01`;

      const [walletResult, transactionResult, budgetResult] =
        await Promise.all([
          supabase
            .from("wallet_settings")
            .select("opening_balance")
            .maybeSingle(),

          supabase
            .from("transactions")
            .select(
              "id, type, amount, category, description, transaction_date"
            )
            .gte("transaction_date", firstDay)
            .lt("transaction_date", nextMonth)
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false }),

          supabase
            .from("monthly_budgets")
            .select("budget_amount")
            .eq("month", month)
            .maybeSingle(),
        ]);

      const firstError =
        walletResult.error ||
        transactionResult.error ||
        budgetResult.error;

      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }

      setOpeningBalance(
        Number(walletResult.data?.opening_balance) || 0
      );
      setTransactions(transactionResult.data || []);
      setBudget(Number(budgetResult.data?.budget_amount) || 0);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const income = transactions
    .filter((item) => item.type === "in")
    .reduce((total, item) => total + Number(item.amount), 0);

  const expense = transactions
    .filter((item) => item.type === "out")
    .reduce((total, item) => total + Number(item.amount), 0);

  const balance = openingBalance + income - expense;
  const remaining = budget - expense;
  const percentage =
    budget > 0 ? Math.round((expense / budget) * 100) : 0;
  const progress = Math.min(percentage, 100);

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">
          My<span>Dompet</span>
        </h2>

        <nav className="navigation">
          <a className="nav-active" href="#dashboard">
            ▦ Dashboard
          </a>
          <a href="#history">◷ History</a>
          <a href="#cashflow">↗ Cash Flow</a>
        </nav>

        <div className="sidebar-note">
          <p>Kelola uangmu dengan lebih sadar.</p>
          <span>Personal Finance Tracker</span>

          <button
            className="primary-button"
            onClick={() => setShowLogoutDialog(true)}
            style={{ marginTop: 16, width: "100%" }}
          >
            Keluar
          </button>
        </div>
      </aside>

      <section className="content" id="dashboard">
        <header className="page-header">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Pantau kondisi keuanganmu hari ini.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              alert("Form transaksi akan kita buat berikutnya.")
            }
          >
            + Tambah Transaksi
          </button>
        </header>

        {error && (
          <div className="card" role="alert">
            <strong>Data belum berhasil dimuat.</strong>
            <p>{error}</p>
            <p className="muted">
              Periksa autentikasi dan izin akses Supabase.
            </p>
          </div>
        )}

        <section className="summary-grid">
          {/* Card Saldo Aktif dengan Icon Pensil di Ujung Kanan */}
          <article className="card balance-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <p className="card-label" style={{ margin: 0 }}>Total Saldo Aktif</p>
              <button
                type="button"
                onClick={() => {
                  setBalanceInput(String(openingBalance));
                  setShowBalanceDialog(true);
                }}
                title="Edit Saldo Awal"
                style={{
                  background: "rgba(255, 255, 255, 0.3)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1e293b",
                  transition: "background 0.2s",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </div>

            <h2>{formatRupiah(balance)}</h2>
            <p className="muted" style={{ margin: 0 }}>
              Saldo awal + pemasukan − pengeluaran
            </p>
          </article>

          <article className="card">
            <p className="card-label">Pemasukan Bulan Ini</p>
            <h2 className="green-text">{formatRupiah(income)}</h2>
            <p className="muted">Total uang masuk</p>
          </article>

          <article className="card">
            <p className="card-label">Pengeluaran Bulan Ini</p>
            <h2 className="red-text">{formatRupiah(expense)}</h2>
            <p className="muted">Total uang keluar</p>
          </article>
        </section>

        <section className="main-grid">
          <article className="card budget-card" id="cashflow">
            <div className="section-heading">
              <div>
                <p className="card-label">MONTHLY BUDGET</p>
                <h2>Anggaran Bulanan</h2>
              </div>
              <span className="budget-badge">Bulan ini</span>
            </div>

            <h3>
              {formatRupiah(expense)}{" "}
              <span>/ {formatRupiah(budget)}</span>
            </h3>

            <div className="progress-track">
              <div
                className="progress-value"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="budget-footer">
              <span>
                {budget > 0 ? `${percentage}% terpakai` : "0% terpakai"}
              </span>
              <strong>
                {formatRupiah(remaining)} tersisa
              </strong>
            </div>

            <p className="muted budget-note">
              {loading
                ? "Memuat data dari Supabase..."
                : budget === 0
                  ? "Belum ada anggaran untuk bulan ini."
                  : remaining < 0
                    ? "Pengeluaran sudah melebihi anggaran."
                    : "Anggaran berdasarkan data bulan ini."}
            </p>
          </article>

          <article className="card transactions-card" id="history">
            <div className="section-heading">
              <div>
                <p className="card-label">RECENT ACTIVITY</p>
                <h2>Transaksi Terbaru</h2>
              </div>
              <a className="text-link" href="#history">
                Lihat semua
              </a>
            </div>

            <div className="transaction-list">
              {loading ? (
                <p className="muted">Memuat transaksi...</p>
              ) : transactions.length === 0 ? (
                <p className="muted">
                  Belum ada transaksi bulan ini.
                </p>
              ) : (
                transactions.slice(0, 5).map((transaction) => {
                  const isIncome = transaction.type === "in";

                  return (
                    <div
                      className="transaction-row"
                      key={transaction.id}
                    >
                      <div className="transaction-icon">
                        {isIncome ? "↙" : "↗"}
                      </div>

                      <div className="transaction-info">
                        <strong>
                          {transaction.description ||
                            transaction.category}
                        </strong>
                        <span>
                          {transaction.category} ·{" "}
                          {formatDate(transaction.transaction_date)}
                        </span>
                      </div>

                      <strong
                        className={
                          isIncome ? "green-text" : "amount-text"
                        }
                      >
                        {isIncome ? "+" : "−"}
                        {formatRupiah(transaction.amount)}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>

        <footer className="page-footer">
          MyDompet · Catat, pahami, kendalikan.
        </footer>
      </section>

      {showLogoutDialog && (
        <div
          role="presentation"
          onClick={() => {
            if (!loggingOut) setShowLogoutDialog(false);
          }}
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
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "#fff",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 id="logout-title" style={{ marginTop: 0 }}>
              Konfirmasi Log Out
            </h2>

            <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
              Apakah kamu yakin ingin keluar dari akun MyDompet?
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogoutDialog(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: "#10b981",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={async () => {
                  setLoggingOut(true);

                  const { error } = await supabase.auth.signOut();

                  if (error) {
                    alert("Gagal keluar: " + error.message);
                    setLoggingOut(false);
                    return;
                  }

                  router.replace("/login");
                  router.refresh();
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: loggingOut ? "wait" : "pointer",
                }}
              >
                {loggingOut ? "Memproses..." : "Log Out"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showBalanceDialog && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!savingBalance) {
              setShowBalanceDialog(false);
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="balance-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="balance-dialog-title">Edit Saldo Awal</h2>

            <p className="muted">
              Masukkan saldo awal yang ingin kamu gunakan untuk menghitung
              saldo aktif.
            </p>

            <label htmlFor="opening-balance-input">
              Nominal saldo awal (Rp)
            </label>

            <input
              id="opening-balance-input"
              type="number"
              min="0"
              step="1"
              value={balanceInput}
              onChange={(event) => setBalanceInput(event.target.value)}
              placeholder="Contoh: 1500000"
              disabled={savingBalance}
            />

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowBalanceDialog(false)}
                disabled={savingBalance}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveBalance}
                disabled={savingBalance}
              >
                {savingBalance ? "Menyimpan..." : "Simpan Saldo"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}