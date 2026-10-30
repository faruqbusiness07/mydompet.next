"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

/* ---------- Helper format ---------- */

export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatPercent(value) {
  const number = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
  return `${number}%`;
}

export function formatDate(dateString) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

const CATEGORY_ICONS = {
  makan: "🍽️",
  kebutuhan: "🏠",
  jajan: "🛍️",
};

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[String(name || "").toLowerCase()] || "💸";
}

/* ---------- Warna status anggaran ---------- */
// Ubah dua angka ini kalau mau batasnya lebih ketat / longgar
export const WARNING_AT = 60; // >= 60% terpakai -> oranye
export const DANGER_AT = 80; // >= 80% terpakai -> merah

export function getBudgetTone(percentUsed, budget) {
  if (!(budget > 0)) {
    return { key: "none", color: "#94a3b8", bg: "#f1f5f9", label: "Belum ada anggaran" };
  }
  if (percentUsed >= 100) {
    return { key: "over", color: "#dc2626", bg: "#fee2e2", label: "Anggaran terlampaui" };
  }
  if (percentUsed >= DANGER_AT) {
    return { key: "danger", color: "#dc2626", bg: "#fee2e2", label: "Anggaran hampir habis" };
  }
  if (percentUsed >= WARNING_AT) {
    return { key: "warning", color: "#f59e0b", bg: "#fef3c7", label: "Anggaran mulai menipis" };
  }
  return { key: "safe", color: "#10b981", bg: "#dcfce7", label: "Anggaran aman" };
}

/* ---------- Rentang bulan berjalan ---------- */

function getMonthInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const pad = (n) => String(n + 1).padStart(2, "0");

  const next = new Date(year, month + 1, 1);

  return {
    firstDay: `${year}-${pad(month)}-01`,
    nextMonth: `${next.getFullYear()}-${pad(next.getMonth())}-01`,
    monthLabel: new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(now),
  };
}

/* ---------- Hook utama ---------- */

export default function useMonthlyReport() {
  const router = useRouter();
  const info = useMemo(() => getMonthInfo(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        router.replace("/login");
        return;
      }

      const userId = data.session.user.id;

      const [txResult, budgetResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, type, amount, category, description, transaction_date")
          .gte("transaction_date", info.firstDay)
          .lt("transaction_date", info.nextMonth)
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false }),

        supabase
          .from("monthly_budgets")
          .select("budget_amount")
          .eq("user_id", userId)
          .eq("month", info.firstDay)
          .maybeSingle(),
      ]);

      if (!active) return;

      const firstError = txResult.error || budgetResult.error;

      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }

      setTransactions(txResult.data || []);
      setBudget(Number(budgetResult.data?.budget_amount) || 0);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [router, info]);

  const report = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenseItems = transactions.filter((t) => t.type === "out");
    const expense = expenseItems.reduce((sum, t) => sum + Number(t.amount), 0);

    const map = new Map();
    for (const t of expenseItems) {
      const name = t.category || "Lainnya";
      if (!map.has(name)) map.set(name, { name, total: 0, items: [] });
      const entry = map.get(name);
      entry.total += Number(t.amount);
      entry.items.push(t);
    }

    const categories = [...map.values()]
      .sort((a, b) => b.total - a.total)
      .map((c) => ({
        ...c,
        percentOfExpense: expense > 0 ? (c.total / expense) * 100 : 0,
        percentOfBudget: budget > 0 ? (c.total / budget) * 100 : 0,
      }));

    return {
      income,
      expense,
      net: income - expense,
      remaining: budget - expense,
      percentUsed: budget > 0 ? (expense / budget) * 100 : 0,
      categories,
    };
  }, [transactions, budget]);

  return {
    loading,
    error,
    budget,
    monthLabel: info.monthLabel,
    ...report,
  };
}