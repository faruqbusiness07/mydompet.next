"use client";
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MyDompet — History</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../dashboard/style.css" />
</head>
<body class="text-[#111827] bg-[#f4f5f7]">
  <main class="max-w-[1400px] mx-auto p-3 sm:p-6">
    <div class="shell rounded-[28px] p-4 sm:p-6 bg-white min-h-[90vh] flex gap-5 relative overflow-hidden shadow-sm">

      {/*SIDEBAR DRAWER */}
      <aside id="drawer" class="drawer" aria-label="Menu navigasi">
        <div class="drawer-inner p-4">
          <div class="flex items-center justify-between mb-6 px-2 pt-2">
            <p class="brand font-bold text-lg text-[#10B981]">MyDompet</p>
            <button id="drawerClose" class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center" aria-label="Tutup menu">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
          <nav class="space-y-1">
            <a href="../dashboard/index.html" class="nav-item">
              <svg class="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
              Dashboard
            </a>
            <a href="../history/index.html" class="nav-item active">
              <svg class="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              History
            </a>
            <a href="../cashflow/index.html" class="nav-item">
              <svg class="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
              Cash Flow
            </a>
          </nav>
        </div>
      </aside>

      <!-- CONTENT -->
      <div class="content flex-1 min-w-0">
        <!-- TOP HEADER -->
        <header class="flex flex-wrap items-center gap-3 mb-6">
          <button id="btnToggleMenu" class="h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center transition shrink-0" aria-label="Buka Menu">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          <div class="flex items-center gap-3 mr-auto">
            <img src="https://i.pravatar.cc/80?img=12" alt="Foto profil" class="w-11 h-11 rounded-full object-cover bg-lime-200" />
            <h1 class="text-xl sm:text-2xl font-semibold">History Transaksi</h1>
          </div>
        </header>

        <!-- HISTORY BODY -->
        <section class="space-y-4">
          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
            <p>Riwayat bulan-bulan sebelumnya kosong dulu.</p>
          </div>
        </section>
      </div>

    </div>
  </main>
  <script src="../dashboard/script.js"></script>
</body>
</html>