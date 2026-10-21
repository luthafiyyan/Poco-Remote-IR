export const ANDROID_FILES = {
  mainActivity: `package com.example.pocoirremote

import android.content.Context
import android.hardware.ConsumerIrManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity untuk membungkus antarmuka web Samsung Remote
 * dan menghubungkannya dengan sensor IR Blaster bawaan Poco X7 Pro via ConsumerIrManager.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var irManager: ConsumerIrManager? = null

    companion object {
        private const val TAG = "PocoIRRemote"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Inisialisasi ConsumerIrManager dari sistem Android
        irManager = getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

        // Verifikasi keberadaan modul IR Emitter fisik
        if (irManager == null || !irManager!!.hasIrEmitter()) {
            Log.w(TAG, "Device ini tidak mendeteksi hardware IR Blaster!")
            Toast.makeText(
                this,
                "Peringatan: Sensor IR Blaster tidak terdeteksi di perangkat ini.",
                Toast.LENGTH_LONG
            ).show()
        } else {
            Log.i(TAG, "IR Blaster hardware siap digunakan.")
        }

        // Setup WebView
        webView = findViewById(R.id.webView)
        setupWebView()

        // Muat file antarmuka web dari folder assets
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            displayZoomControls = false
            builtInZoomControls = false
            cacheMode = WebSettings.LOAD_NO_CACHE
        }

        // Hilangkan background default agar menyatu dengan Glassmorphism
        webView.setBackgroundColor(0xFF07090E.toInt())
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false

        // Daftarkan JavascriptInterface dengan nama "AndroidIR"
        webView.addJavascriptInterface(AndroidIRBridge(this, irManager), "AndroidIR")

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Log.d(TAG, "Halaman Web Remote berhasil dimuat.")
            }
        }
    }

    /**
     * Interface jembatan antara JavaScript dan Android Native
     */
    class AndroidIRBridge(
        private val context: Context,
        private val irManager: ConsumerIrManager?
    ) {

        /**
         * Mengecek apakah perangkat memiliki pemancar IR fisik
         */
        @JavascriptInterface
        fun hasIrEmitter(): Boolean {
            return irManager?.hasIrEmitter() == true
        }

        /**
         * Mengirimkan sinyal IR ke TV Samsung
         * @param frequency Frekuensi carrier (38000 Hz untuk Samsung)
         * @param patternString Deretan mikrodetik dipisahkan koma (contoh: "4500,4500,560,1690,...")
         * @return true jika berhasil dieksekusi oleh hardware
         */
        @JavascriptInterface
        fun transmitIR(frequency: Int, patternString: String): Boolean {
            return try {
                if (irManager == null || !irManager.hasIrEmitter()) {
                    Log.e(TAG, "Gagal transmit: Hardware IR tidak tersedia.")
                    return false
                }

                // Parse string deretan pulsa menjadi array integer IntArray
                val pattern = patternString.split(",")
                    .map { it.trim().toInt() }
                    .toIntArray()

                // Eksekusi transmisi melalui driver ConsumerIrManager Android
                irManager.transmit(frequency, pattern)
                Log.d(TAG, "Transmit IR sukses: freq=$frequency Hz, pulsa=\${pattern.size} elemen.")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Kesalahan saat transmit IR: \${e.message}", e)
                false
            }
        }

        /**
         * Tambahan: Haptic feedback native Android jika diperlukan
         */
        @JavascriptInterface
        fun triggerHaptic(durationMs: Long) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                    vibratorManager?.defaultVibrator?.vibrate(
                        VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(durationMs)
                }
            } catch (e: Exception) {
                Log.w(TAG, "Gagal haptic: \${e.message}")
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`,

  androidManifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.pocoirremote">

    <!-- Izin wajib untuk mengakses sensor transmisi IR Blaster -->
    <uses-permission android:name="android.permission.TRANSMIT_IR" />

    <!-- Izin getar untuk haptic feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Deklarasi hardware IR Blaster (required=false agar tidak memblokir instalasi saat debugging) -->
    <uses-feature
        android:name="android.hardware.consumerir"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="Poco IR Remote"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,

  activityMainXml: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#07090E"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:overScrollMode="never"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`,

  setupGuide: `# Panduan Langkah-demi-Langkah Android Studio (Poco X7 Pro)

### 1. Struktur Folder Project di Android Studio
Letakkan file yang telah dibuat sesuai direktori berikut:
\`\`\`text
PocoIRRemote/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── assets/
│   │   │   │   └── index.html               <-- Paste Single-File index.html di sini
│   │   │   ├── java/com/example/pocoirremote/
│   │   │   │   └── MainActivity.kt          <-- Paste kode MainActivity.kt
│   │   │   ├── res/
│   │   │   │   └── layout/
│   │   │   │       └── activity_main.xml    <-- Paste layout WebView
│   │   │   └── AndroidManifest.xml          <-- Paste kode Manifest
\`\`\`

### 2. Catatan Khusus Xiaomi HyperOS / Poco X7 Pro
1. **Sensor IR Blaster:** Poco X7 Pro dilengkapi dengan IR Blaster hardware di sisi atas bezel ponsel.
2. **Izin Sistem:** ConsumerIrManager tidak memerlukan runtime prompt permission di Android 14/15, cukup izin deklarasi \`<uses-permission android:name="android.permission.TRANSMIT_IR" />\` di \`AndroidManifest.xml\`.
3. **Optimasi Baterai HyperOS:** Pada beberapa ROM MIUI/HyperOS, pastikan aplikasi tidak dibatasi oleh "Battery Saver" ketat agar thread transmisi IR tidak di-kill saat di latar belakang.
4. **Jarak Transmisi:** Sudut pancaran IR Blaster smartphone efektif pada rentang 1-7 meter lurus mengarah ke receiver IR di bawah bezel TV Samsung.`
};
