"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./AddTransactionModal.css"; // pakai style fp-* yang sama

function formatNominal(value) {
  const digits = String(value).replace(/\D/g, "").replace(/^0+/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

/**
 * Props:
 * - open        : boolean
 * - balance     : saldo aktif yang sedang tampil
 * - netAllTime  : total bersih semua transaksi (pemasukan - pengeluaran)
 * - onClose     : () => void
 * - onSaved     : (newOpeningBalance:number) => void
 */
export default function EditBalanceModal({
  open,
  balance,
  netAllTime,
  onClose,
  onSaved,
}) {
  const [nominal, setNominal] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Isi ulang form setiap kali dibuka
  useEffect(() => {
    if (!open) return;
    setNominal(balance > 0 ? formatNominal(Math.round(balance)) : "");
    setError("");
    setSaving(false);
  }, [open, balance]);

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const digits = nominal.replace(/\D/g, "");

    if (digits === "") {
      setError("Masukkan saldo aktif kamu (boleh 0).");
      return;
    }

    const target = Number(digits);

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      // Saldo dasar dihitung mundur supaya saldo yang tampil = angka yang diketik
      const newOpening = target - netAllTime;

      const { error: saveError } = await supabase
        .from("wallet_settings")
        .upsert(
          {
            user_id: user.id,
            opening_balance: newOpening,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (saveError) {
        setError("Gagal menyimpan: " + saveError.message);
        return;
      }

      onSaved(newOpening);
      onClose();
    } catch (err) {
      setError("Terjadi kesalahan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fp-overlay"
      role="presentation"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <form
        className="fp-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eb-title"
        noValidate
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="fp-close-btn"
          aria-label="Tutup form"
          title="Tutup"
          onClick={onClose}
          disabled={saving}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <header className="fp-head">
          <div className="fp-ico" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
              <path d="M16 13h2" />
            </svg>
          </div>
          <h1 id="eb-title">Edit Saldo Aktif</h1>
        </header>

        <div className="fp-field">
          <span className="fp-label">Saldo saat ini</span>
          <div className="fp-chip" style={{ background: "#f0fdf4", color: "#15803d" }}>
            {formatRupiah(balance)}
          </div>
        </div>

        <div className="fp-field">
          <label className="fp-label" htmlFor="ebNominal">
            Saldo aktif yang benar (Rp)
          </label>
          <input
            id="ebNominal"
            className="fp-input"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="1.500.000"
            value={nominal}
            onChange={(e) => setNominal(formatNominal(e.target.value))}
            disabled={saving}
          />
        </div>

        <p className="fp-hint">
          Masukkan jumlah uang yang kamu punya sekarang. Transaksi berikutnya
          akan menambah atau mengurangi saldo ini secara otomatis.
        </p>

        {error && (
          <p className="fp-submit-err" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="fp-btn" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Saldo"}
        </button>
      </form>
    </div>
  );
}