
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
  const router = useRouter();
  const [openingBalance, setOpeningBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
   async function loadDashboard() {
  setLoading(true);
  setError("");

  const { data, error: sessionError } =
    await supabase.auth.getSession();

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
      const nextMonth = `${nextMonthDate.getFullYear()}-${String(
        nextMonthDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

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
  }, []);

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
          <article className="card balance-card">
            <p className="card-label">Total Saldo Aktif</p>
            <h2>{formatRupiah(balance)}</h2>
            <p className="muted">
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
    </main>
  );
}
