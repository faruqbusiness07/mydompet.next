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
    return { key: "none", color: "#94a3b8", bg: "#f1f5f9", label: "Belum ada anggaran", short: "Tanpa anggaran" };
  }
  if (percentUsed >= 100) {
    return { key: "over", color: "#dc2626", bg: "#fee2e2", label: "Anggaran terlampaui", short: "Terlampaui" };
  }
  if (percentUsed >= DANGER_AT) {
    return { key: "danger", color: "#dc2626", bg: "#fee2e2", label: "Anggaran hampir habis", short: "Hampir habis" };
  }
  if (percentUsed >= WARNING_AT) {
    return { key: "warning", color: "#f59e0b", bg: "#fef3c7", label: "Anggaran mulai menipis", short: "Menipis" };
  }
  return { key: "safe", color: "#10b981", bg: "#dcfce7", label: "Anggaran aman", short: "Aman" };
}

/* ---------- Helper bulan ---------- */
// Kunci bulan selalu berbentuk "YYYY-MM-01" (sama dengan kolom monthly_budgets.month)

const pad = (n) => String(n).padStart(2, "0");

export function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

export function shiftMonthKey(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

export function monthInfoFromKey(key) {
  const [y, m] = key.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const next = new Date(y, m, 1);

  return {
    firstDay: key,
    nextMonth: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-01`,
    monthLabel: new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(first),
  };
}

/* ---------- Hook: laporan satu bulan ---------- */
// Tanpa argumen = bulan berjalan (dipakai Cash Flow).
// Dengan argumen "YYYY-MM-01" = bulan tersebut (dipakai History).

export default function useMonthlyReport(monthKey = getCurrentMonthKey()) {
  const router = useRouter();
  const info = useMemo(() => monthInfoFromKey(monthKey), [monthKey]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setTransactions([]);
      setBudget(0);

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
    monthKey,
    monthLabel: info.monthLabel,
    ...report,
  };
}

/* ---------- Hook: ringkasan beberapa bulan terakhir ---------- */
// Butuh fungsi SQL get_monthly_expense_totals(since_date) di Supabase.

export function useMonthList(count = 6) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        router.replace("/login");
        return;
      }

      const userId = data.session.user.id;
      const current = getCurrentMonthKey();
      const keys = Array.from({ length: count }, (_, i) =>
        shiftMonthKey(current, -i)
      );
      const since = keys[keys.length - 1];

      const [totalsResult, budgetsResult] = await Promise.all([
        supabase.rpc("get_monthly_expense_totals", { since_date: since }),
        supabase
          .from("monthly_budgets")
          .select("month, budget_amount")
          .eq("user_id", userId)
          .gte("month", since),
      ]);

      if (!active) return;

      const firstError = totalsResult.error || budgetsResult.error;

      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }

      const totals = new Map(
        (totalsResult.data || []).map((row) => [row.month_start, Number(row.total)])
      );
      const budgets = new Map(
        (budgetsResult.data || []).map((row) => [row.month, Number(row.budget_amount)])
      );

      setMonths(
        keys.map((key) => {
          const total = totals.get(key) || 0;
          const budget = budgets.get(key) || 0;
          const percentUsed = budget > 0 ? (total / budget) * 100 : 0;

          return {
            key,
            label: monthInfoFromKey(key).monthLabel,
            isCurrent: key === current,
            total,
            budget,
            percentUsed,
            tone: getBudgetTone(percentUsed, budget),
          };
        })
      );
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [router, count]);

  return { loading, error, months };
}