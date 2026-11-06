"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatNominal, parseNominal } from "../../lib/format";
import "./AddTransactionModal.css"; // pakai style fp-* yang sama

export default function AddGoalModal({ open, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [nominal, setNominal] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setNominal("");
    setErrors({});
    setSubmitError("");
    setSaving(false);
  }, [open]);

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
    setSubmitError("");

    const target = parseNominal(nominal);
    const next = {};

    if (!name.trim()) next.name = "Nama target wajib diisi.";
    if (target <= 0) next.nominal = "Masukkan target lebih dari 0.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

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
        .from("savings_goals")
        .insert({
          user_id: user.id,
          name: name.trim(),
          target_amount: target,
        })
        .select("id, name, target_amount")
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
        aria-labelledby="ag-title"
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <header className="fp-head">
          <div className="fp-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h1 id="ag-title">Target Tabungan Baru</h1>
        </header>

        <div className="fp-field">
          <label className="fp-label" htmlFor="agName">
            Mau menabung untuk apa?
          </label>
          <input
            id="agName"
            className="fp-input"
            maxLength={30}
            autoComplete="off"
            autoFocus
            placeholder="Contoh: Sepatu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
          {errors.name && <small className="fp-err">{errors.name}</small>}
        </div>

        <div className="fp-field">
          <label className="fp-label" htmlFor="agTarget">
            Target nominal (Rp)
          </label>
          <input
            id="agTarget"
            className="fp-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="400.000"
            value={nominal}
            onChange={(e) => setNominal(formatNominal(e.target.value))}
            disabled={saving}
          />
          {errors.nominal && <small className="fp-err">{errors.nominal}</small>}
        </div>

        {submitError && (
          <p className="fp-submit-err" role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" className="fp-btn" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Target"}
        </button>
      </form>
    </div>
  );
}