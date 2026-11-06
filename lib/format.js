// "15000" -> "15.000" (dipakai di input nominal)
export function formatNominal(value) {
  const digits = String(value).replace(/\D/g, "").replace(/^0+/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// "15.000" -> 15000
export function parseNominal(value) {
  return Number(String(value).replace(/\D/g, "")) || 0;
}

// Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD
export function todayLocal() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}