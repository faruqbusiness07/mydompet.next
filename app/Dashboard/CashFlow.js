<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MyDompet — Cash Flow</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../dashboard/style.css" />
</head>
<body class="text-[#111827] bg-[#f4f5f7]">
  <main class="max-w-[1400px] mx-auto p-3 sm:p-6">
    <div class="shell rounded-[28px] p-4 sm:p-6 bg-white min-h-[90vh] flex gap-5 relative overflow-hidden shadow-sm">

      <!-- SIDEBAR DRAWER -->
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
            <a href="../history/index.html" class="nav-item">
              <svg class="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              History
            </a>
            <a href="../cashflow/index.html" class="nav-item active">
              <svg class="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
              Cash Flow
            </a>
          </nav>
        </div>
      </aside>

      <!-- CONTENT -->
      <div class="content flex-1 min-w-0 space-y-6">
        <!-- TOP HEADER -->
        <header class="flex flex-wrap items-center gap-3 mb-6">
          <button id="btnToggleMenu" class="h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center transition shrink-0" aria-label="Buka Menu">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          <div class="flex items-center gap-3 mr-auto">
            <img src="https://i.pravatar.cc/80?img=12" alt="Foto profil" class="w-11 h-11 rounded-full object-cover bg-lime-200" />
            <div>
              <h1 class="text-xl sm:text-2xl font-semibold">Cash Flow</h1>
              <p class="text-xs text-gray-500">Pantau anggaran dan catatan pengeluaran bulan ini.</p>
            </div>
          </div>
          <select class="rounded-full bg-white border border-gray-200 px-4 h-9 text-sm outline-none">
            <option>April 2026</option>
            <option selected>Oktober 2026</option>
          </select>
        </header>

        <!-- Top Cash Flow Row -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-7 bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Anggaran contoh</p>
                <p class="text-2xl font-bold">Rp15.000.000</p>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm text-gray-500">Pengeluaran bulan ini</p>
                  <button class="text-xs text-emerald-600 underline">Ubah</button>
                </div>
                <p class="text-2xl font-bold">Rp12.830.000</p>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>85,53% terpakai</span>
                <span>14,47% tersisa</span>
              </div>
              <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-600 rounded-full" style="width: 85.53%"></div>
              </div>
            </div>
            <p class="text-xs text-gray-400">Anggaran ini asumsi demo, bukan data aktual. Nilainya dapat diubah.</p>
          </div>

          <div class="lg:col-span-5 bg-[#87E64B] p-6 rounded-2xl flex flex-col justify-between text-emerald-950">
            <div>
              <p class="text-sm font-medium opacity-80">Sisa anggaran contoh</p>
              <p class="text-3xl font-bold mt-1">Rp2.170.000</p>
              <p class="text-4xl font-extrabold mt-2">14,47%</p>
            </div>
            <p class="text-xs opacity-75 mt-4">dari anggaran contoh Rp15.000.000<br>Periode Oktober 2026</p>
          </div>
        </div>

        <!-- Bottom Cash Flow Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 class="font-bold mb-1">Pengeluaran per kategori</h3>
            <p class="text-xs text-gray-500 mb-4">Proporsi dari total pengeluaran Rp12.830.000</p>
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-gray-200/60">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-emerald-100 grid place-items-center text-emerald-800 font-bold">🍽️</span>
                  <div>
                    <p class="font-semibold text-sm">Makan</p>
                    <p class="text-xs text-gray-500">Total kategori makan bulan ini</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-sm">Rp4.500.000</p>
                  <p class="text-xs text-gray-400">35,07%</p>
                </div>
              </div>

              <div class="flex items-center justify-between pb-3 border-b border-gray-200/60">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-blue-100 grid place-items-center text-blue-800 font-bold">🏠</span>
                  <div>
                    <p class="font-semibold text-sm">Kebutuhan</p>
                    <p class="text-xs text-gray-500">Termasuk sewa apartemen yang tercatat</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-sm">Rp5.830.000</p>
                  <p class="text-xs text-gray-400">45,44%</p>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-purple-100 grid place-items-center text-purple-800 font-bold">🛍️</span>
                  <div>
                    <p class="font-semibold text-sm">Jajan</p>
                    <p class="text-xs text-gray-500">Total kategori jajan bulan ini</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-sm">Rp2.500.000</p>
                  <p class="text-xs text-gray-400">19,49%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold">Catatan pengeluaran</h3>
              <button class="px-3 py-1 bg-white border border-gray-200 text-xs rounded-full font-medium shadow-sm">Catatan parsial</button>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-gray-200/60">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full bg-gray-200 grid place-items-center text-xs">🏠</span>
                  <div>
                    <p class="font-semibold text-sm">Sewa Apartemen</p>
                    <p class="text-xs text-gray-500">Kebutuhan • 5 Apr 2026</p>
                  </div>
                </div>
                <p class="font-bold text-sm text-red-600">Rp5.830.000</p>
              </div>

              <div class="flex items-center justify-between pb-3 border-b border-gray-200/60">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full bg-gray-200 grid place-items-center text-xs">🍽️</span>
                  <div>
                    <p class="font-semibold text-sm">Restoran Keluarga</p>
                    <p class="text-xs text-gray-500">Makan • 10 Apr 2026</p>
                  </div>
                </div>
                <p class="font-bold text-sm text-red-600">Rp350.000</p>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-6">Catatan parsial, bukan seluruh transaksi Oktober 2026.</p>
          </div>
        </div>

      </div>

    </div>
  </main>
  <script src="../dashboard/script.js"></script>
</body>
</html>