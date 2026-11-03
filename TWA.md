# Android TWA (Bubblewrap)

Membungkus PWA yang sudah di-deploy (HTTPS) menjadi APK/AAB.

## Prasyarat
- PWA sudah live di HTTPS (lihat DEPLOYMENT.md), manifest & SW valid.
- Node.js 18+, JDK 17, Android SDK (Bubblewrap bisa mengunduhnya saat `init` pertama).
- `npm i -g @bubblewrap/cli`

## Nilai yang harus Anda tentukan (tidak diisi di repo ini)
| Item | Keterangan |
|---|---|
| Application ID | mis. `com.namaanda.mywallet` — permanen setelah rilis Play Store |
| HTTPS origin / host | domain tempat PWA di-host |
| Keystore + alias + password | dibuat sendiri; simpan aman, jangan di-commit |

## Langkah
```bash
mkdir mywallet-android && cd mywallet-android
bubblewrap init --manifest=https://YOUR-DOMAIN/manifest.webmanifest
```
Saat ditanya: Application ID = nilai Anda; name/launcher name = `MyWallet`; start URL = `/index.html`;
display = `standalone`; theme/background = `#5237c4`; icon = `icons/icon-512.png`;
maskable icon = `icons/maskable-512.png`. Template acuan: `twa/twa-manifest.example.json`.

```bash
bubblewrap build        # menghasilkan app-release-signed.apk dan app-release-bundle.aab
```
Pertama kali, `build` akan membuat keystore (`android.keystore`) bila belum ada — cadangkan file dan passwordnya.

## Digital Asset Links
```bash
bubblewrap fingerprint list      # tampilkan SHA-256 fingerprint
```
1. Salin `.well-known/assetlinks.json.example` → `.well-known/assetlinks.json`.
2. Isi `package_name` (Application ID) dan `sha256_cert_fingerprints`.
3. Deploy; cek `https://YOUR-DOMAIN/.well-known/assetlinks.json` terbuka tanpa redirect.
4. Bila memakai Play App Signing, tambahkan **juga** fingerprint "App signing key certificate" dari
   Play Console (fingerprint upload key saja tidak cukup untuk build dari Play).

Tanpa Asset Links yang valid, aplikasi tampil dengan bar alamat Chrome (fallback Custom Tabs).

## Uji & rilis
```bash
bubblewrap install      # pasang APK ke perangkat via adb
```
- APK untuk uji langsung; **AAB** untuk Google Play.
- Naikkan `appVersionCode` setiap rilis (`bubblewrap update` / edit `twa-manifest.json`).

## Catatan
- Nama dan ikon sengaja netral ("MyWallet"). Halaman asli memuat teks/merek "OVO"; periksa kebijakan
  merek dagang dan kebijakan Play Store (aplikasi keuangan, peniruan) sebelum mempublikasikan.
