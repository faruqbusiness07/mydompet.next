
const transactions = [
  { id: 1, name: "Belanja kebutuhan", category: "Kebutuhan", date: "Hari ini", amount: -150000 },
  { id: 2, name: "Jajan siomay", category: "Jajan", date: "Kemarin", amount: -25000 },
  { id: 3, name: "Pemasukan", category: "Gaji", date: "Kemarin", amount: 500000 },
];

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Home() {
  const balance = 38000000;
  const income = 5000000;
  const expense = 1750000;
  const budget = 700000;

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">My<span>Dompet</span></h2>

        <nav className="navigation">
          <a className="nav-active" href="#dashboard">▦ Dashboard</a>
          <a href="#history">◷ History</a>
          <a href="#cashflow">↗ Cash Flow</a>
        </nav>

        <div className="sidebar-note">
          <p>Kelola uangmu dengan lebih sadar.</p>
          <span>Personal Finance Tracker</span>
        </div>
      </aside>

      <section className="content" id="dashboard">
        <header className="page-header">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Dashboard</h1>
            <p className="subtitle">Pantau kondisi keuanganmu hari ini.</p>
          </div>

          <button className="primary-button" onClick={() => alert("Form transaksi akan kita buat berikutnya.")}>
            + Tambah Transaksi
          </button>
        </header>

        <section className="summary-grid">
          <article className="card balance-card">
            <p className="card-label">Total Saldo Aktif</p>
            <h2>{formatRupiah(balance)}</h2>
            <p className="muted">Saldo awal + pemasukan − pengeluaran</p>
          </article>

          <article className="card">
            <p className="card-label">Pemasukan Bulan Ini</p>
            <h2 className="green-text">{formatRupiah(income)}</h2>
            <p className="muted">Total uang masuk</p>
          </article>

          <article className="card">
            <p className="card-label">Pengeluaran Bulan Ini</p>
            <h2 className="red-text">{formatRupiah(expense)}</h2>
            <p className="muted">Total uang keluar</p>
          </article>
        </section>

        <section className="main-grid">
          <article className="card budget-card" id="cashflow">
            <div className="section-heading">
              <div>
                <p className="card-label">MONTHLY BUDGET</p>
                <h2>Anggaran Bulanan</h2>
              </div>
              <span className="budget-badge">Bulan ini</span>
            </div>

            <h3>{formatRupiah(expense)} <span>/ {formatRupiah(budget)}</span></h3>

            <div className="progress-track">
              <div
                className="progress-value"
                style={{ width: `${Math.min((expense / budget) * 100, 100)}%` }}
              />
            </div>

            <div className="budget-footer">
              <span>{Math.round((expense / budget) * 100)}% terpakai</span>
              <strong>{formatRupiah(budget - expense)} tersisa</strong>
            </div>

            <p className="muted budget-note">
              Angka di atas adalah data contoh untuk menguji tampilan.
            </p>
          </article>

          <article className="card transactions-card" id="history">
            <div className="section-heading">
              <div>
                <p className="card-label">RECENT ACTIVITY</p>
                <h2>Transaksi Terbaru</h2>
              </div>
              <a className="text-link" href="#history">Lihat semua</a>
            </div>

            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  <div className="transaction-icon">
                    {transaction.amount > 0 ? "↙" : "↗"}
                  </div>

                  <div className="transaction-info">
                    <strong>{transaction.name}</strong>
                    <span>{transaction.category} · {transaction.date}</span>
                  </div>

                  <strong className={transaction.amount > 0 ? "green-text" : "amount-text"}>
                    {transaction.amount > 0 ? "+" : "−"}
                    {formatRupiah(Math.abs(transaction.amount))}
                  </strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="page-footer">
          MyDompet · Catat, pahami, kendalikan.
        </footer>
      </section>
    </main>
  );
}
