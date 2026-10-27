"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./AddTransactionModal.css";

const CATEGORIES = ["Makan", "Kebutuhan", "Jajan"];

function todayLocal() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// "15000" -> "15.000"
function formatNominal(value) {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function AddTransactionModal({ open, onClose, onSaved }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [nominal, setNominal] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (!open) return;
    setCategory(CATEGORIES[0]);
    setDescription("");
    setNominal("");
    setDate(todayLocal());
    setErrors({});
    setSubmitError("");
    setSaving(false);
  }, [open]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  function validate() {
    const next = {};
    const amount = Number(nominal.replace(/\./g, ""));

    if (!description.trim()) next.description = "Keterangan wajib diisi.";
    if (!amount || amount <= 0) next.nominal = "Masukkan nominal lebih dari 0.";
    if (!date) next.date = "Tanggal wajib diisi.";
    else if (date > todayLocal())
      next.date = "Tanggal tidak boleh di masa depan.";

    setErrors(next);
    return { ok: Object.keys(next).length === 0, amount };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const { ok, amount } = validate();
    if (!ok) return;

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSubmitError("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "out",
          amount,
          category,
          description: description.trim(),
          transaction_date: date,
        })
        .select("id, type, amount, category, description, transaction_date")
        .single();

      if (error) {
        setSubmitError("Gagal menyimpan: " + error.message);
        return;
      }

      onSaved(data);
      onClose();
    } catch (err) {
      setSubmitError("Terjadi kesalahan: " + err.message);
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
        aria-labelledby="fp-title"
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
              <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3 5 4.5Z" />
              <path d="M9 9h6M9 13h6" />
            </svg>
          </div>
          <h1 id="fp-title">Pengeluaran</h1>
        </header>

        <div className="fp-field">
          <span className="fp-label">Jenis transaksi</span>
          <div className="fp-chip">Pengeluaran</div>
        </div>

        <fieldset className="fp-field fp-fieldset">
          <legend className="fp-label">Kategori</legend>
          <div className="fp-options">
            {CATEGORIES.map((item) => (
              <label className="fp-radio" key={item}>
                <input
                  type="radio"
                  name="kategori"
                  value={item}
                  checked={category === item}
                  onChange={() => setCategory(item)}
                />
                <span className="dot" />
                <span className="txt">{item}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="fp-field">
          <label className="fp-label" htmlFor="fpKeterangan">
            Keterangan
          </label>
          <input
            id="fpKeterangan"
            className="fp-input"
            maxLength={40}
            autoComplete="off"
            placeholder="Contoh: Siomay Manahan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
          {errors.description && (
            <small className="fp-err">{errors.description}</small>
          )}
        </div>

        <div className="fp-field">
          <label className="fp-label" htmlFor="fpNominal">
            Nominal (Rp)
          </label>
          <input
            id="fpNominal"
            className="fp-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="15.000"
            value={nominal}
            onChange={(e) => setNominal(formatNominal(e.target.value))}
            disabled={saving}
          />
          {errors.nominal && <small className="fp-err">{errors.nominal}</small>}
        </div>

        <div className="fp-field">
          <label className="fp-label" htmlFor="fpTanggal">
            Tanggal pengeluaran
          </label>
          <input
            id="fpTanggal"
            type="date"
            className="fp-input"
            max={todayLocal()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={saving}
          />
          {errors.date && <small className="fp-err">{errors.date}</small>}
        </div>

        <p className="fp-hint">
          Default-nya tanggal hari ini. Kamu tetap bisa mengubah tanggal jika
          mencatat transaksi sebelumnya.
        </p>

        {submitError && (
          <p className="fp-submit-err" role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" className="fp-btn" disabled={saving}>
          {saving ? "Menyimpan..." : "Oke"}
        </button>
      </form>
    </div>
  );
}