# Raisa Profil (Rey-prof) — Dark Liquid Glass UI

Website profil digital personal untuk **Rey** dengan estetika **Dark Liquid Glass UI**, performa responsif mobile-first, dan sistem otentikasi admin serverless yang kompatibel dengan Vercel.

---

## Panduan Deployment ke Vercel

### 1. Masukkan Environment Variables di Vercel
Buka dashboard Vercel:
1. Buka project **Rey-prof** di [vercel.com](https://vercel.com)
2. Masuk ke tab **Settings** → **Environment Variables**
3. Tambahkan variable:
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: *(masukkan password/PIN rahasia admin Anda)*
   - **Environment**: Centang **Production**, **Preview**, dan **Development**
4. Klik **Save**

*(Opsional)* **Penyimpanan Profil Permanen di Vercel**:
1. Masuk ke tab **Storage** di Vercel Dashboard
2. Pilih **Create Database** → **KV** (Powered by Upstash)
3. Hubungkan (Connect) ke project `Rey-prof`
4. Vercel secara otomatis menyambungkan `KV_REST_API_URL` dan `KV_REST_API_TOKEN`.

### 2. Redeploy
1. Masuk ke tab **Deployments** di Vercel
2. Klik tombol titik tiga **(...)** pada deployment terakhir
3. Pilih **Redeploy** (centang "Redeploy with existing build cache" atau fresh build)

---

## Cara Akses Panel Admin
1. Buka website (misal: `https://rey-profil.vercel.app`)
2. Di bagian Hero profile, **ketuk teks nama "REY" sebanyak 5 kali berturut-turut**
3. Modal **Admin Authentication** akan terbuka
4. Masukkan password/PIN yang telah diatur pada variable `ADMIN_PASSWORD`
5. Setelah terverifikasi, panel **Admin Edit Panel** akan muncul untuk mengedit profil, tautan, proyek, dan kontak secara langsung.

---

## Arsitektur & Endpoint API (Vercel Functions)
- `POST /api/auth/login`: Otentikasi admin (server-side timing-safe validation)
- `GET /api/auth/verify`: Verifikasi token sesi admin
- `GET /api/profile`: Mengambil data profil publik
- `PUT /api/profile`: Memperbarui data profil (memerlukan token admin)
- `POST /api/profile/reset`: Mengembalikan profil ke data bawaan (memerlukan token admin)
- `GET /api/health`: Healthcheck status sistem
