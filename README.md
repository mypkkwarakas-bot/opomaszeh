# MyWallet — Pure HTML Repository

Dua HTML asli digabung menjadi satu aplikasi statis (PWA, siap dibungkus Android TWA).
Tanpa framework, tanpa build step.

```
mywallet/
├── index.html                  entry point (shell yang menampung kedua halaman)
├── pages/
│   ├── movo.html               HTML asli "movo (1).html"  — TIDAK DIUBAH
│   └── finance-profile.html    HTML asli "ovo-finance-profile (1).html" — TIDAK DIUBAH
├── assets/shell.js             lapisan integrasi (navigasi + registrasi SW)
├── manifest.webmanifest        Web App Manifest
├── sw.js                       Service Worker (offline app shell)
├── icons/                      ikon PWA / launcher (any + maskable)
├── .well-known/                template Digital Asset Links (lihat README di dalamnya)
├── twa/                        template konfigurasi Bubblewrap
├── scripts/verify-sources.js   cek kedua HTML asli masih byte-identik
├── package.json
├── README.md
├── DEPLOYMENT.md
└── TWA.md
```

## Cara integrasi

- `pages/movo.html` dan `pages/finance-profile.html` adalah salinan **byte-identik** dari file sumber
  (`npm run check:sources` memverifikasi SHA-256). Keduanya tetap bisa dibuka langsung secara mandiri.
- `index.html` memuat keduanya sebagai dua `iframe` same-origin dan hanya menyambungkan dua tombol
  navigasi bawah yang di file asli masih berupa demo (`toast` / `alert`):

  | Dari | Tombol | Perilaku asli | Di aplikasi terpadu |
  |---|---|---|---|
  | movo.html | **Finance** | toast "Finance (demo)" | membuka finance-profile.html |
  | finance-profile.html | **Home** | `alert('Home')` | kembali ke movo.html |

  Semua interaksi lain (PIN, tab, banner, Profile, Ubah Profil, dst.) tetap dijalankan kode asli.
  Tombol **Profile** di movo.html tetap berperilaku asli (kembali ke layar kunci PIN).
- State tiap halaman terjaga saat berpindah (mis. movo.html tetap terbuka setelah PIN).
- Tombol Back Android menjalankan perpindahan halaman (`#finance` ↔ halaman utama).
  Buka `/#finance` untuk langsung ke Finance & Profile.

## Menjalankan lokal

```bash
npm start            # http://localhost:8080  (Service Worker aktif di localhost)
npm run check:sources
```

## Catatan data & privasi

- `movo.html` memanggil Supabase (REST + WebSocket Realtime) untuk saldo. Service Worker **tidak
  menyentuh** permintaan itu: tidak di-cache, langsung ke jaringan. Saat offline, saldo tidak
  diperbarui (perilaku asli: mempertahankan angka terakhir).
- `finance-profile.html` memuat font Plus Jakarta Sans dari Google Fonts; SW menyimpannya agar
  tersedia offline setelah dibuka sekali online. Tanpa itu halaman memakai `system-ui` (fallback asli).
- Nama aplikasi, ikon, dan manifest sengaja memakai nama netral "MyWallet" dan glyph dompet buatan
  sendiri, bukan nama/logo OVO.
