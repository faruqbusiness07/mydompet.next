
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";

export default function TestSupabase() {
  const [status, setStatus] = useState("Menguji koneksi...");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("transactions")
        .select("id")
        .limit(1);

      if (error) {
        setStatus("Koneksi atau query gagal");
        setDetail(error.message);
        return;
      }

      setStatus("Koneksi berhasil!");
      setDetail(`Query berhasil. Baris yang terbaca: ${data.length}`);
    }

    testConnection();
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>Tes Koneksi Supabase</h1>
      <p>{status}</p>
      <p>{detail}</p>
    </main>
  );
}
