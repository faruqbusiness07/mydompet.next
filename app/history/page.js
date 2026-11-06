"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import useMonthlyReport, {
  useMonthList,
  getCurrentMonthKey,
  formatRupiah,
  formatPercent,
  formatDate,
  getCategoryIcon,
  getBudgetTone,
} from "../../lib/useMonthlyReport";
import "../components/report.css";

// Jumlah kartu bulan yang ditampilkan (bulan ini + bulan-bulan sebelumnya)
const MONTH_COUNT = 6;

export default function HistoryPage() {
  const currentKey = getCurrentMonthKey();
  const [selected, setSelected] = useState(currentKey);

  const list = useMonthList(MONTH_COUNT);
  const r = useMonthlyReport(selected);

  const isCurrent = selected === currentKey;
  const tone = getBudgetTone(r.percentUsed, r.budget);
  const hasBudget = r.budget > 0;
  const over = r.remaining < 0;

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

        {(r.error || list.error) && (
          <div className="card" role="alert" style={{ marginBottom: 16 }}>
            <strong>Data belum berhasil dimuat.</strong>
            <p>{r.error || list.error}</p>
            <p className="muted">
              Periksa autentikasi, izin akses Supabase, dan fungsi
              get_monthly_expense_totals.
            </p>
          </div>
        )}

        {/* Pilih bulan */}
        <p className="card-label" style={{ margin: "0 0 10px" }}>
          PILIH BULAN
        </p>
        <section className="rp-months">
          {list.loading
            ? Array.from({ length: MONTH_COUNT }).map((_, i) => (
                <div className="rp-month rp-month-skeleton" key={i} />
              ))
            : list.months.map((m) => (
                <button
                  type="button"
                  key={m.key}
                  className={`rp-month${m.key === selected ? " rp-month-active" : ""}`}
                  onClick={() => setSelected(m.key)}
                  aria-pressed={m.key === selected}
                >
                  <span className="rp-month-name">
                    {m.label}
                    {m.isCurrent && <em className="rp-month-tag">Bulan ini</em>}
                  </span>
                  <strong className="rp-month-total">{formatRupiah(m.total)}</strong>
                  <span
                    className="rp-badge rp-badge-sm"
                    style={{ background: m.tone.bg, color: m.tone.color }}
                  >
                    {m.tone.short}
                  </span>
                </button>
              ))}
        </section>

        {/* Ringkasan bulan terpilih */}
        <section className="rp-grid-3">
          <article className="card">
            <p className="card-label">Total Pengeluaran</p>
            <p className="rp-big red-text">{formatRupiah(r.expense)}</p>
            <p className="rp-sub">{r.monthLabel}</p>
          </article>

          <article className="card">
            <p className="card-label">Anggaran {isCurrent ? "Bulan Ini" : r.monthLabel}</p>
            <p className="rp-big">{formatRupiah(r.budget)}</p>
            <p className="rp-sub">
              {hasBudget ? (
                over ? (
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    Melebihi {formatRupiah(Math.abs(r.remaining))}
                  </span>
                ) : (
                  <>Sisa {formatRupiah(r.remaining)}</>
                )
              ) : isCurrent ? (
                <>
                  Belum diatur.{" "}
                  <Link href="/" className="rp-link">
                    Atur di Dashboard
                  </Link>
                </>
              ) : (
                <>Tidak ada anggaran tercatat</>
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
              <p className="rp-empty">
                {isCurrent
                  ? "Belum ada pengeluaran bulan ini."
                  : `Tidak ada pengeluaran di ${r.monthLabel}.`}
              </p>
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