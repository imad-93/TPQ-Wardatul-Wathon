# TPQ Wardatul Wathon — PWA (Web App + Installable di Android)

Versi ini adalah **Progressive Web App**: satu aplikasi web yang bisa dibuka
di browser apa pun, dan bisa **dipasang ke layar utama Android** (juga
desktop) tanpa lewat Google Play Store — jadi tidak ada biaya pendaftaran
developer sama sekali.

> **Status:** kerangka kode fungsional yang sudah terhubung ke Firebase asli
> (bukan data contoh/mockup). Sudah diperiksa sintaksnya, **belum pernah
> dijalankan di browser sungguhan** karena environment penyusunan tidak
> punya akses ke proyek Firebase maupun browser untuk menguji end-to-end.
> Ikuti langkah di bawah untuk menjalankan & menguji sendiri.

---

## 1. Apa yang sudah berfungsi

- **Login "akun = username"**: aktivasi sekali (username + password) →
  tersimpan di `localStorage` perangkat → kunjungan berikutnya cukup
  password. Lihat komentar panjang di `js/auth.js` untuk detail alurnya.
- **Realtime Firestore** di ketiga portal — bukan data statis. Perubahan
  yang dibuat ustadzah/admin langsung muncul di portal wali tanpa refresh
  (dan sebaliknya), karena semua pakai `onSnapshot`.
- **Offline persistence bawaan Firestore** (`enableIndexedDbPersistence`
  di `js/firebase-config.js`) — riwayat ngaji, status tagihan, dan
  pengumuman yang sudah pernah dimuat tetap bisa dibaca/ditulis offline,
  lalu otomatis tersinkron saat online kembali. **Catatan:** unggah file
  (PDF, foto, pesan suara) tetap butuh koneksi aktif saat itu juga.
- **Pembuatan akun otomatis** — saat admin menambah santri/ustadzah baru
  lewat form, **Cloud Function `provisionAccount`** (folder `functions/`)
  langsung membuat akun Firebase Auth + dokumen `users/{uid}` + menautkannya
  ke dokumen santri/ustadzah terkait, dalam satu langkah. Admin juga bisa
  **mengatur ulang kata sandi** (`resetAccountPassword`) lewat tombol "Atur
  ulang kata sandi" di form ubah data, dan akun otomatis **dinonaktifkan**
  (`deactivateAccount`, bukan dihapus) saat data santri dihapus.
- **Instalasi ke Android** lewat `manifest.webmanifest` + `service-worker.js`
  — banner "Pasang aplikasi" otomatis muncul di Chrome Android (event
  `beforeinstallprompt`, lihat `js/ui-shared.js`).
- **Rekam pesan suara sungguhan** lewat Web `MediaRecorder` API (bukan
  simulasi) — langsung diunggah ke Firebase Storage.
- **Unggah PDF buku, logo, dan QRIS** sungguhan ke Firebase Storage.
- **Pratinjau PDF inline** — tombol "Lihat halaman" di portal wali merender
  halaman PDF sungguhan langsung di dalam modal (pakai pdf.js via CDN,
  lihat `js/portal-wali.js`), lengkap dengan tautan "buka PDF lengkap di
  tab baru" sebagai cadangan bila render gagal (mis. browser lama).
- **Storage rules diperketat berbasis role** — `storage.rules` mengecek
  role pengguna lewat `firestore.get()` (bukan lagi "asal login boleh
  tulis"): hanya admin yang boleh mengunggah buku PDF/logo/QRIS, hanya
  admin/ustadzah yang boleh mengunggah pesan suara, plus validasi ukuran
  & tipe file (PDF maks. 25MB, gambar maks. 5MB, audio maks. 10MB).
- Semua fitur dari daftar Anda: data santri & wali, data ustadzah,
  jilid/kelas, bacaan, hafalan, pesan suara, SPP, tabungan, iuran, QRIS,
  pengumuman, pengaturan admin, logo TPQ, tampilan responsif khusus HP.

## 2. Yang BELUM dikerjakan / perlu tindak lanjut

Ditandai `// TODO:` di kode, ringkasannya:

1. **Payment gateway QRIS resmi** — tombol "Bayar QRIS" masih simulasi
   (langsung menandai lunas). Integrasikan Midtrans/Xendit/provider QRIS
   resmi, dan biarkan **webhook** (via Cloud Function tambahan) yang menulis
   status "lunas", bukan client.
2. **Ikon PWA** — `icons/icon-*.png` saat ini masih ikon placeholder "TW"
   buatan otomatis. Ganti dengan logo asli TPQ sebelum dipublikasikan luas
   (ukuran 192×192, 512×512, dan versi maskable 512×512).
3. **Notifikasi ke wali** — pesan/pengumuman baru belum mengirim push
   notification. Bisa ditambahkan dengan Firebase Cloud Messaging (FCM) +
   Cloud Function trigger `onDocumentCreated` di koleksi terkait.
4. **Pembatasan pesan suara per-kelas** — saat ini semua ustadzah/admin
   boleh mengunggah pesan suara untuk santri manapun (lihat komentar di
   `storage.rules`). Untuk lembaga dengan banyak cabang/ustadzah yang
   tidak saling dipercaya, persempit ke ustadzah pengampu jilid santri itu
   saja (butuh 2 lookup Firestore berantai di rules, atau custom claims).

## 3. Cara menjalankan & menguji di komputer Anda

### a. Prasyarat
- Akun [Firebase](https://console.firebase.google.com/) dengan paket **Blaze**
  (pay-as-you-go). **Catatan penting:** Cloud Functions (yang dipakai untuk
  pembuatan akun otomatis) mengharuskan paket Blaze, bukan Spark (gratis)
  — tapi Blaze tetap punya kuota gratis bulanan yang besar (2 juta
  panggilan function/bulan), jadi untuk TPQ dengan puluhan/ratusan santri
  kemungkinan besar **tetap Rp0** selama tidak melewati kuota gratis
  tersebut. Blaze hanya mensyaratkan kartu kredit/debit terpasang sebagai
  jaga-jaga jika kuota gratis terlampaui. Hosting, Firestore, dan Storage
  sendiri tetap punya kuota gratis yang cukup besar di paket Spark maupun Blaze.
- [Node.js](https://nodejs.org/) + Firebase CLI: `npm install -g firebase-tools`.

### b. Buat & hubungkan proyek Firebase
1. Buat proyek baru di Firebase Console.
2. Aktifkan **Authentication → Email/Password**, **Cloud Firestore**
   (mode production), dan **Cloud Storage**.
3. Firebase Console → Project settings → General → "Your apps" → tambah
   **Web app** → salin objek `firebaseConfig` yang muncul.
4. Tempel nilai-nilai itu ke `js/firebase-config.js` (menggantikan semua
   tulisan `GANTI_...`).
5. Edit `.firebaserc`, ganti `GANTI_DENGAN_PROJECT_ID_FIREBASE_ANDA` dengan
   Project ID Anda.

### c. Pasang dependency Cloud Functions
```bash
cd functions
npm install
cd ..
```

### d. Jalankan secara lokal
```bash
firebase login
firebase serve
```
Buka `http://localhost:5000` di Chrome. (Service worker & install prompt
hanya aktif di `localhost` atau domain HTTPS — ini normal, bukan bug.)
Untuk menguji Cloud Functions secara lokal juga, gunakan
`firebase emulators:start` (mencakup Auth, Firestore, Storage, Functions
sekaligus) dan aktifkan blok "mode emulator lokal" di
`js/firebase-config.js`.

### e. Buat akun admin pertama (satu-satunya langkah manual)
Akun admin pertama **tidak bisa** dibuat lewat `provisionAccount` (karena
fungsi itu sendiri mensyaratkan pemanggilnya sudah admin — ayam-telur).
Buat sekali saja secara manual:
1. Firebase Console → Authentication → Add user → email
   `admin@tpq-wardatulwathon.app`, isi password.
2. Firestore Console → buat koleksi `users` → dokumen dengan ID = UID user
   yang baru dibuat di langkah 1 → isi field:
   ```json
   { "username": "admin", "role": "admin", "displayName": "Admin TPQ" }
   ```
3. Login ke aplikasi dengan username `admin` + password tadi. Dari sini,
   admin bisa menambah ustadzah & santri (beserta akunnya) langsung lewat UI.

### f. Deploy semuanya ke Firebase (gratis)
```bash
firebase deploy
```
Perintah ini men-deploy Hosting, Firestore rules, Storage rules, dan
Cloud Functions sekaligus. Firebase akan memberi URL publik seperti
`https://project-id.web.app` — inilah alamat yang dibagikan ke wali,
ustadzah, dan admin.

## 4. Cara memasang PWA di HP Android

1. Buka URL aplikasi (hasil `firebase deploy`) di **Chrome Android**.
2. Akan muncul banner "Pasang aplikasi" otomatis di bagian bawah layar
   (atau tap menu titik tiga → **"Tambahkan ke Layar Utama" / "Install app"**).
3. Setelah dipasang, ikon TPQ Wardatul Wathon muncul di layar utama HP
   dan terbuka seperti aplikasi native (tanpa address bar browser).

Ini sepenuhnya gratis — tidak ada proses review, tidak ada biaya
pendaftaran developer, dan pembaruan aplikasi otomatis didapat pengguna
setiap kali online (lewat mekanisme cache-busting di `service-worker.js`).

## 5. Struktur Firestore (sama seperti versi Flutter)

```
users/{uid}                → { username, role, displayName, refId }
jilid/{jilidId}             → { nama, ustadzahId, bukuBacaanUrl, bukuHafalanUrl, ... }
ustadzah/{ustadzahId}       → { uid, nama, hp, jilidId }
santri/{santriId}           → { nama, jilidId, waliUid, waliNama, waliHp }
  └─ riwayat_bacaan/{id}    → { halaman, status, pesan, pesanTipe, audioUrl, tanggal }
  └─ riwayat_hafalan/{id}   → (struktur sama)
  └─ keuangan/{id}          → { jenis, label, nominal, status, metode, tanggalBayar }
pengumuman/{id}              → { judul, isi, tanggal }
settings/umum                → { logoUrl, qrisUrl, sppNominal, sppJatuhTempo, tabunganMinSetor, tabunganKeterangan }
  └─ iuran_items/{id}       → { nama, nominal, deadline }
```

## 6. Struktur berkas proyek

```
index.html              → app shell, referensi manifest & service worker
manifest.webmanifest     → metadata PWA (nama, ikon, warna tema)
service-worker.js        → caching app shell untuk kemampuan offline
css/styles.css           → semua styling (token desain sama dgn prototype)
js/firebase-config.js    → inisialisasi Firebase (ISI KREDENSIAL ANDA)
js/state.js              → state aplikasi sederhana
js/formatters.js         → format rupiah, tanggal, dsb.
js/auth.js               → login/logout, alur aktivasi username
js/db.js                 → semua akses Firestore
js/storage.js            → unggah file ke Firebase Storage
js/functions-client.js   → wrapper pemanggilan Cloud Functions (provisioning akun)
js/ui-shared.js          → modal, toast, offline banner, install prompt
js/portal-wali.js        → portal wali
js/portal-ustadzah.js    → portal ustadzah
js/portal-admin.js       → portal admin
js/main.js               → entry point & routing berbasis role
icons/                   → ikon PWA (GANTI dengan logo asli TPQ)
firestore.rules          → aturan keamanan Firestore
storage.rules             → aturan keamanan Storage
firebase.json / .firebaserc → konfigurasi deploy Firebase Hosting & Functions
functions/index.js       → Cloud Functions: provisionAccount, resetAccountPassword, deactivateAccount
functions/package.json   → dependency Cloud Functions (firebase-admin, firebase-functions)
```
