"use client";

import Link from "next/link";
import Sidebar from "../components/Sidebar";
import useMonthlyReport, {
  formatRupiah,
  formatPercent,
  getCategoryIcon,
  getBudgetTone,
} from "../../lib/useMonthlyReport";
import "../components/report.css";

export default function CashFlowPage() {
  const r = useMonthlyReport();
  const tone = getBudgetTone(r.percentUsed, r.budget);
  const hasBudget = r.budget > 0;
  const over = r.remaining < 0;

  return (
    <main className="dashboard">
      <Sidebar />

      <section className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">ARUS KAS</p>
            <h1>Cash Flow</h1>
            <p className="subtitle">Pemasukan dan pengeluaran {r.monthLabel}</p>
          </div>
        </header>

        {r.error && (
          <div className="card" role="alert" style={{ marginBottom: 16 }}>
            <strong>Data belum berhasil dimuat.</strong>
            <p>{r.error}</p>
            <p className="muted">Periksa autentikasi dan izin akses Supabase.</p>
          </div>
        )}

        {/* Ringkasan pemasukan / pengeluaran */}
        <section className="rp-grid-3">
          <article className="card">
            <p className="card-label">Pemasukan Bulan Ini</p>
            <p className="rp-big green-text">{formatRupiah(r.income)}</p>
            <p className="rp-sub">Total uang masuk</p>
          </article>

          <article className="card">
            <p className="card-label">Pengeluaran Bulan Ini</p>
            <p className="rp-big red-text">{formatRupiah(r.expense)}</p>
            <p className="rp-sub">Total uang keluar</p>
          </article>

          <article className="card">
            <p className="card-label">Selisih Bersih</p>
            <p
              className="rp-big"
              style={{ color: r.net >= 0 ? "#059669" : "#dc2626" }}
            >
              {r.net >= 0 ? "+" : "−"}
              {formatRupiah(Math.abs(r.net))}
            </p>
            <p className="rp-sub">Pemasukan − pengeluaran</p>
          </article>
        </section>

        <section className="rp-grid-2">
          {/* Anggaran */}
          <article className="card">
            <div className="rp-row-between" style={{ marginBottom: 12 }}>
              <div>
                <p className="card-label">SISA ANGGARAN</p>
                <h2 style={{ margin: "4px 0 0" }}>Anggaran Bulan Ini</h2>
              </div>
              <span
                className="rp-badge"
                style={{ background: tone.bg, color: tone.color }}
              >
                {tone.label}
              </span>
            </div>

            {hasBudget ? (
              <>
                <p className="rp-big" style={{ color: tone.color }}>
                  {over ? "Lebih " : ""}
                  {formatRupiah(Math.abs(r.remaining))}
                </p>
                <p className="rp-sub" style={{ marginBottom: 16 }}>
                  {over ? "melebihi anggaran" : "tersisa"} dari{" "}
                  {formatRupiah(r.budget)}
                </p>

                <div className="rp-bar rp-bar-lg" aria-hidden="true">
                  <div
                    className="rp-bar-fill"
                    style={{
                      width: `${Math.min(r.percentUsed, 100)}%`,
                      background: tone.color,
                    }}
                  />
                </div>

                <div className="rp-row-between" style={{ marginTop: 10 }}>
                  <span className="rp-sub">
                    <strong style={{ color: tone.color }}>
                      {formatPercent(r.percentUsed)}
                    </strong>{" "}
                    terpakai
                  </span>
                  <span className="rp-sub">
                    {formatRupiah(r.expense)} / {formatRupiah(r.budget)}
                  </span>
                </div>
              </>
            ) : (
              <p className="rp-sub">
                Belum ada anggaran untuk bulan ini.{" "}
                <Link href="/" className="rp-link">
                  Atur di Dashboard
                </Link>
              </p>
            )}
          </article>

          {/* Per kategori */}
          <article className="card">
            <p className="card-label">PENGELUARAN PER KATEGORI</p>
            <h2 style={{ margin: "4px 0 16px" }}>Ke Mana Uangnya Pergi</h2>

            {r.loading ? (
              <p className="muted">Memuat data...</p>
            ) : r.categories.length === 0 ? (
              <p className="rp-empty">Belum ada pengeluaran bulan ini.</p>
            ) : (
              <div className="rp-stack">
                {r.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="rp-cat-head" style={{ marginBottom: 8 }}>
                      <div className="rp-cat-ico" aria-hidden="true">
                        {getCategoryIcon(cat.name)}
                      </div>
                      <div className="rp-cat-name">
                        <strong>{cat.name}</strong>
                        <span>{cat.items.length} transaksi</span>
                      </div>
                      <div className="rp-cat-total">
                        <strong>{formatRupiah(cat.total)}</strong>
                        <span>{formatPercent(cat.percentOfExpense)} dari pengeluaran</span>
                      </div>
                    </div>

                    <div className="rp-bar" aria-hidden="true">
                      <div
                        className="rp-bar-fill"
                        style={{
                          width: `${Math.min(cat.percentOfExpense, 100)}%`,
                          background: "#10b981",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <footer className="page-footer">
          MyDompet · Catat, pahami, kendalikan.
        </footer>
      </section>
    </main>
  );
}