"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatNominal, parseNominal } from "../../lib/format";
import "./AddTransactionModal.css";

export default function AddSavingsTransactionModal({ open, goals, onClose, onSaved }) {
  const [goalId, setGoalId] = useState("");
  const [nominal, setNominal] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGoalId(goals.length > 0 ? goals[0].id : "");
    setNominal("");
    setErrors({});
    setSubmitError("");
    setSaving(false);
  }, [open, goals]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const amount = parseNominal(nominal);
    const next = {};

    if (!goalId) next.goal = "Pilih target tabungan terlebih dahulu.";
    if (amount <= 0) next.nominal = "Masukkan nominal setoran lebih dari 0.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setSubmitError("Sesi login tidak ditemukan.");
        return;
      }

      // 1. Insert ke tabel savings_transactions
      const { data: txData, error: txError } = await supabase
        .from("savings_transactions")
        .insert({
          user_id: user.id,
          goal_id: goalId,
          amount: amount,
          transaction_date: new Date().toISOString().split("T")[0],
        })
        .select("id, amount, transaction_date, goal_id")
        .single();

      if (txError) throw txError;

      // 2. Ambil current_amount goal terkait untuk di-update
      const selectedGoal = goals.find((g) => g.id === goalId);
      const newCurrentAmount = Number(selectedGoal.current_amount || 0) + amount;

      const { error: updateError } = await supabase
        .from("savings_goals")
        .update({ current_amount: newCurrentAmount })
        .eq("id", goalId);

      if (updateError) throw updateError;

      onSaved({ ...txData, goal_title: selectedGoal.title }, newCurrentAmount);
      onClose();
    } catch (err) {
      setSubmitError("Terjadi kesalahan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fp-overlay" role="presentation" onClick={() => !saving && onClose()}>
      <form
        className="fp-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button type="button" className="fp-close-btn" onClick={onClose} disabled={saving}>
          ✕
        </button>

        <header className="fp-head">
          <h1>Tambah Setoran Tabungan</h1>
        </header>

        <div className="fp-field">
          <label className="fp-label">Pilih Target Tabungan</label>
          <select
            className="fp-input"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            disabled={saving}
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {errors.goal && <small className="fp-err">{errors.goal}</small>}
        </div>

        <div className="fp-field">
          <label className="fp-label">Nominal Setoran (Rp)</label>
          <input
            className="fp-input"
            inputMode="numeric"
            placeholder="10.000"
            value={nominal}
            onChange={(e) => setNominal(formatNominal(e.target.value))}
            disabled={saving}
            autoFocus
          />
          {errors.nominal && <small className="fp-err">{errors.nominal}</small>}
        </div>

        {submitError && <p className="fp-submit-err">{submitError}</p>}

        <button type="submit" className="fp-btn" disabled={saving}>
          {saving ? "Menyimpan..." : "Setor Tabungan"}
        </button>
      </form>
    </div>
  );
}