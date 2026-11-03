# DEPLOYMENT

Situs statis murni. Unggah seluruh isi folder ke hosting statis ber-**HTTPS** (Netlify, Cloudflare Pages,
GitHub Pages, Firebase Hosting, Nginx, dll.). Service Worker dan TWA mensyaratkan HTTPS.

## Checklist

1. Deploy **di root domain** (mis. `https://wallet.example.com/`). Jika di sub-path, `start_url`, `scope`,
   dan `id` di `manifest.webmanifest` serta `register('sw.js')` tetap relatif sehingga berfungsi, tetapi
   untuk TWA root domain lebih sederhana.
2. Pastikan header:
   - `manifest.webmanifest` → `Content-Type: application/manifest+json`
   - `sw.js` → `Cache-Control: no-cache` (agar update SW cepat terdeteksi)
   - `/.well-known/assetlinks.json` → `application/json`, tanpa redirect (setelah dibuat, lihat TWA.md)
3. Setelah update konten: naikkan `VERSION` di `sw.js` (`mywallet-v1` → `mywallet-v2`).
4. Verifikasi di Chrome DevTools → Application: Manifest tanpa error, Service Worker "activated",
   tombol Install tersedia. Lighthouse → kategori PWA.
5. `npm run check:sources` sebelum rilis untuk memastikan HTML asli tidak berubah.

## Contoh Nginx

```nginx
location = /sw.js                { add_header Cache-Control "no-cache"; }
location = /manifest.webmanifest { default_type application/manifest+json; }
location /.well-known/           { default_type application/json; }
```

## Yang TIDAK di-cache oleh Service Worker

Semua permintaan lintas-origin selain Google Fonts (termasuk Supabase REST/Realtime), semua non-GET,
dan respons API. Hanya app shell statis dan font yang disimpan.
