"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "▦ Dashboard" },
  { href: "/history", label: "◷ History" },
  { href: "/cashflow", label: "↗ Cash Flow" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Gagal keluar: " + error.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="sidebar">
        <h2 className="brand">
          My<span>Dompet</span>
        </h2>

        <nav className="navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "nav-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-note">
          <p>Kelola uangmu dengan lebih sadar.</p>
          <span>Personal Finance Tracker</span>

          <button
            className="primary-button"
            onClick={() => setShowLogoutDialog(true)}
            style={{ marginTop: 16, width: "100%" }}
          >
            Keluar
          </button>
        </div>
      </aside>

      {showLogoutDialog && (
        <div
          role="presentation"
          onClick={() => {
            if (!loggingOut) setShowLogoutDialog(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.55)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "#fff",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 id="logout-title" style={{ marginTop: 0 }}>
              Konfirmasi Log Out
            </h2>

            <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
              Apakah kamu yakin ingin keluar dari akun MyDompet?
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogoutDialog(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: "#10b981",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: loggingOut ? "wait" : "pointer",
                }}
              >
                {loggingOut ? "Memproses..." : "Log Out"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}