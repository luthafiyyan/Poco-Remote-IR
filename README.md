# 📱 Poco Universal IR Remote & QWERTY Keyboard

[![Download APK](https://img.shields.io/badge/Download-APK%20Poco%20Remote-FFCE00?style=for-the-badge&logo=android&logoColor=black)](https://github.com/luthafiyyan/Poco-Remote-IR/releases/latest)
[![Build APK](https://github.com/luthafiyyan/Poco-Remote-IR/actions/workflows/build-apk.yml/badge.svg)](https://github.com/luthafiyyan/Poco-Remote-IR/actions/workflows/build-apk.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://poco-remote-ir.vercel.app)

Aplikasi remote kontrol universal cerdas berbasis **IR Blaster fisik** untuk smartphone **Poco & Xiaomi**. Dilengkapi dengan antarmuka modern yang ramah pengguna mobile, **Keyboard QWERTY virtual** untuk pengetikan cepat di YouTube TV / Browser TV, serta dukungan ke berbagai brand Smart TV dan Monitor PC.

---

## 📥 Download File APK Siap Pakai

Untuk mengontrol TV sungguhan menggunakan pemancar inframerah fisik HP Poco Anda, unduh file APK resmi yang otomatis dikompilasi oleh GitHub Actions:

👉 **[Download Poco-Remote-IR.apk (Versi Terbaru)](https://github.com/luthafiyyan/Poco-Remote-IR/releases/latest)**

### Cara Instal di HP Poco / Xiaomi:
1. Klik link download di atas menggunakan browser di HP Poco Anda.
2. Unduh file **`Poco-Remote-IR.apk`**.
3. Buka file yang selesai diunduh. Jika muncul notifikasi keamanan *"Izinkan penginstalan dari sumber ini"*, klik **Izinkan / Settings -> Allow**.
4. Selesai! Buka aplikasi **Poco IR Remote**, arahkan bagian atas HP ke TV atau Monitor, dan tekan tombol remote!

---

## ⚡ Fitur Utama

### 1. 📡 Transmisi Inframerah Fisik (Hardware Native)
* Memanfaatkan modul **IR Blaster fisik** pada HP Poco / Xiaomi via Android `ConsumerIrManager`.
* Mendukung frekuensi carrier carrier presisi (38 kHz, 37 kHz, hingga 40 kHz).
* Bit-order LSB-first per byte sesuai standar industri NEC / Renesas & SIRC.

### 2. ⌨️ Keyboard QWERTY & Auto-Typist TV
* **Ngetik Lancar di TV**: Ketik teks di keyboard QWERTY HP, lalu aplikasi secara otomatis menghitung rute panah (Up/Down/Left/Right/OK) tercepat untuk mengetik di keyboard virtual layar TV YouTube / Browser.
* **Shortcut Cepat**: Tombol instan untuk `youtube.com`, `google.com`, genre musik, film, dan pencarian cepat.
* **Voice-to-Text (Speech Recognition)**: Pencarian suara langsung ditranslasikan ke tombol navigasi TV.

### 3. 📺 Multi-Brand Smart TV & Monitor PC
Mendukung berbagai merk populer di Indonesia:
* **Toshiba TV**:
  * **REGZA / CT-Series**: Address resmi NEC `0x40BF` (Power `0x40BF12ED`), kompatibel CT-90326, CT-90400, Pro Theatre, Power TV.
  * **Android TV / Smart TV**: Address `0xBF40` (Power `0xBF4001FE`), untuk seri C350, M550, Google TV.
* **Samsung**: Smart TV & Smart Monitor (Protokol Samsung NEC, Addr `0xE0E0`).
* **LG**: WebOS TV & UltraGear Monitor (Addr `0x20DF`).
* **Sony**: Bravia TV (Sony SIRC 40 kHz, 12-bit / 15-bit).
* **Xiaomi**: Mi TV & TV A2 Series (Addr `0x00FF` / `0x04FB`).
* **Polytron**: Smart TV Cinemax (Addr `0x01FE`).
* **TCL**: Google TV & Android TV (Addr `0x26D9`).
* **Sharp**: Aquos LED TV (Addr `0x02FD`).
* **Hisense**: VIDAA & Google TV (Addr `0xBF40`).
* **Coocaa / Changhong / Skyworth**: Coolita & Android TV (Addr `0x00FF`).
* **Panasonic**: Viera Smart TV (Kaseikyo 48-bit, 37 kHz).
* **Monitor PC**: ASUS (ROG/TUF), HP (Omen/Pavilion), Lenovo (Legion/ThinkVision), Dell (UltraSharp), BenQ (Mobiuz/ZOWIE), Acer (Predator/Nitro).

---

## 🛠️ Arsitektur Proyek

```
├── android/                 # Proyek Native Android Studio (Gradle)
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml   # Izin TRANSMIT_IR & VIBRATE
│   │   ├── src/main/java/.../MainActivity.kt # WebView + ConsumerIrManager Bridge
│   │   └── src/main/assets/index.html     # Offline Web UI Bundle
├── src/                     # Source Code React + Vite + TypeScript
│   ├── components/          # QwertyTypingPanel, BrandSelector, Oscilloscope
│   ├── data/                # Database kode hex multi-brand
│   └── utils/               # Generator pulsa IR LSB-first & pathfinder keyboard
├── public/                  # Standalone single-file HTML & PWA manifest
└── .github/workflows/       # Otomatisasi kompilasi APK via GitHub Actions
```

---

## ❓ FAQ (Pertanyaan Umum)

**Q: Kenapa saat dibuka via browser Vercel lampu IR HP tidak menyala?**  
**A:** Sistem operasi Android secara ketat memblokir browser web (seperti Chrome/Firefox/PWA) untuk mengakses lampu inframerah fisik karena pembatasan privasi sistem (`android.permission.TRANSMIT_IR`). Untuk menembakkan sinar IR fisik sungguhan ke TV, Anda wajib menggunakan **file APK yang sudah kami sediakan di atas**.

**Q: Bagaimana cara tes apakah lampu IR fisik Poco benar-benar menyala?**  
**A:** Buka kamera di HP lain, arahkan lubang sensor hitam di ujung atas HP Poco Anda ke kamera tersebut, lalu tekan tombol remote di aplikasi APK. Anda akan melihat **kedipan cahaya ungu/merah muda terang** di layar kamera.

---

## 📄 Lisensi
MIT License © 2026 [luthafiyyan](https://github.com/luthafiyyan)
