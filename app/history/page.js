"use client";

import Link from "next/link";
import Sidebar from "../components/Sidebar";
import useMonthlyReport, {
  formatRupiah,
  formatPercent,
  formatDate,
  getCategoryIcon,
  getBudgetTone,
} from "../../lib/useMonthlyReport";
import "../components/report.css";

export default function HistoryPage() {
  const r = useMonthlyReport();
  const tone = getBudgetTone(r.percentUsed, r.budget);
  const hasBudget = r.budget > 0;

  return (
    <main className="dashboard">
      <Sidebar />

      <section className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">RIWAYAT</p>
            <h1>History</h1>
            <p className="subtitle">Pengeluaran {r.monthLabel}</p>
          </div>
        </header>

        {r.error && (
          <div className="card" role="alert" style={{ marginBottom: 16 }}>
            <strong>Data belum berhasil dimuat.</strong>
            <p>{r.error}</p>
            <p className="muted">Periksa autentikasi dan izin akses Supabase.</p>
          </div>
        )}

        {/* Ringkasan */}
        <section className="rp-grid-3">
          <article className="card">
            <p className="card-label">Total Pengeluaran</p>
            <p className="rp-big red-text">{formatRupiah(r.expense)}</p>
            <p className="rp-sub">{r.monthLabel}</p>
          </article>

          <article className="card">
            <p className="card-label">Anggaran Bulan Ini</p>
            <p className="rp-big">{formatRupiah(r.budget)}</p>
            <p className="rp-sub">
              {hasBudget ? (
                <>Sisa {formatRupiah(Math.max(r.remaining, 0))}</>
              ) : (
                <>
                  Belum diatur.{" "}
                  <Link href="/" className="rp-link">
                    Atur di Dashboard
                  </Link>
                </>
              )}
            </p>
          </article>

          <article className="card">
            <p className="card-label">Anggaran Terpakai</p>
            <p className="rp-big" style={{ color: hasBudget ? tone.color : undefined }}>
              {hasBudget ? formatPercent(r.percentUsed) : "-"}
            </p>
            <p className="rp-sub">{tone.label}</p>
          </article>
        </section>

        {/* Detail per kategori */}
        <section className="rp-stack">
          {r.loading ? (
            <article className="card">
              <p className="muted">Memuat riwayat...</p>
            </article>
          ) : r.categories.length === 0 ? (
            <article className="card">
              <p className="rp-empty">Belum ada pengeluaran bulan ini.</p>
            </article>
          ) : (
            r.categories.map((cat) => (
              <article className="card" key={cat.name}>
                <div className="rp-cat-head">
                  <div className="rp-cat-ico" aria-hidden="true">
                    {getCategoryIcon(cat.name)}
                  </div>

                  <div className="rp-cat-name">
                    <strong>{cat.name}</strong>
                    <span>{cat.items.length} transaksi</span>
                  </div>

                  <div className="rp-cat-total">
                    <strong>{formatRupiah(cat.total)}</strong>
                    <span>
                      {hasBudget
                        ? `${formatPercent(cat.percentOfBudget)} dari anggaran`
                        : "Anggaran belum diatur"}
                    </span>
                  </div>
                </div>

                <div className="rp-bar" aria-hidden="true">
                  <div
                    className="rp-bar-fill"
                    style={{
                      width: `${Math.min(cat.percentOfBudget, 100)}%`,
                      background: "#10b981",
                    }}
                  />
                </div>

                <div className="rp-items">
                  {cat.items.map((t) => (
                    <div className="rp-item" key={t.id}>
                      <div>
                        <strong>{t.description || t.category}</strong>
                        <span>{formatDate(t.transaction_date)}</span>
                      </div>
                      <span className="rp-amount">−{formatRupiah(t.amount)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        <footer className="page-footer">
          MyDompet · Catat, pahami, kendalikan.
        </footer>
      </section>
    </main>
  );
}