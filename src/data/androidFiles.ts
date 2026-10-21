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
 * MainActivity untuk membungkus antarmuka web Multi-Brand Universal IR Remote & QWERTY Keyboard
 * dan menghubungkannya dengan modul IR Blaster fisik Poco / Xiaomi via ConsumerIrManager.
 *
 * Kompatibel dengan:
 * - Poco X3, X4, X5, X6, X7 Pro
 * - Poco F3, F4, F5, F6 Pro
 * - Xiaomi Mi 10, 11, 12, 13, 14
 * - Redmi Note Series (dengan IR Blaster)
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var irManager: ConsumerIrManager? = null

    companion object {
        private const val TAG = "PocoUniversalIR"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Inisialisasi ConsumerIrManager dari sistem Android
        irManager = getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

        // Verifikasi keberadaan modul IR Blaster fisik
        if (irManager == null || !irManager!!.hasIrEmitter()) {
            Log.w(TAG, "Device ini tidak mendeteksi hardware IR Blaster!")
            Toast.makeText(
                this,
                "Peringatan: Sensor IR Blaster tidak terdeteksi di perangkat ini.",
                Toast.LENGTH_LONG
            ).show()
        } else {
            Log.i(TAG, "Hardware IR Blaster Poco/Xiaomi siap digunakan.")
        }

        // Setup WebView
        webView = findViewById(R.id.webView)
        setupWebView()

        // Muat antarmuka dari assets/index.html
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

        // Background gelap OLED sesuai tema Poco
        webView.setBackgroundColor(0xFF07090E.toInt())
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false

        // Daftarkan JavascriptInterface dengan nama "AndroidIR"
        webView.addJavascriptInterface(AndroidIRBridge(this, irManager), "AndroidIR")

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Log.d(TAG, "Remote Universal Web UI berhasil dimuat.")
            }
        }
    }

    /**
     * Interface jembatan antara JavaScript dan Hardware Android Native
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
         * Mengirimkan sinyal IR ke TV atau Monitor dengan frekuensi carrier yang ditentukan:
         * @param frequency Frekuensi carrier dalam Hz (contoh: 38000 Hz untuk Samsung/LG/Xiaomi/TCL, 40000 Hz untuk Sony, 37000 Hz untuk Panasonic)
         * @param patternString Pola durasi pulsa mikrodetik dipisahkan koma (contoh: "9000,4500,560,1690,...")
         * @return true jika transmisi berhasil dieksekusi oleh driver hardware
         */
        @JavascriptInterface
        fun transmitIR(frequency: Int, patternString: String): Boolean {
            return try {
                if (irManager == null || !irManager.hasIrEmitter()) {
                    Log.e(TAG, "Gagal transmit: Hardware IR Blaster tidak tersedia.")
                    return false
                }

                // Parse string deretan pulsa menjadi array integer IntArray
                val pattern = patternString.split(",")
                    .map { it.trim().toInt() }
                    .toIntArray()

                // Transmisi via Android ConsumerIrManager
                irManager.transmit(frequency, pattern)
                Log.d(TAG, "Transmit IR sukses: freq=\${frequency} Hz, pulsa=\${pattern.size} elemen.")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Kesalahan saat transmisi IR: \${e.message}", e)
                false
            }
        }

        /**
         * Haptic feedback getar native saat tombol ditekan
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

    <!-- Izin wajib untuk mengakses transmisi IR Blaster HP Poco / Xiaomi -->
    <uses-permission android:name="android.permission.TRANSMIT_IR" />

    <!-- Izin getar haptic feedback tombol -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Fitur hardware IR Blaster (required=false agar tidak memblokir saat di-debug di emulator) -->
    <uses-feature
        android:name="android.hardware.consumerir"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="Poco Universal IR Remote"
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
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#07090E">

    <WebView
        android:id="@+id/webView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`,

  setupGuide: `# Panduan Kompilasi APK di Android Studio (Poco / Xiaomi IR)

1. Buat project baru di Android Studio ("Empty Views Activity").
2. Salin isi MainActivity.kt ke: \`app/src/main/java/com/example/pocoirremote/MainActivity.kt\`.
3. Salin isi AndroidManifest.xml ke: \`app/src/main/AndroidManifest.xml\`.
4. Salin file \`activity_main.xml\` ke: \`app/src/main/res/layout/activity_main.xml\`.
5. Buat folder assets: \`app/src/main/assets/\`.
6. Download file \`index.html\` dari tombol Download di aplikasi ini, lalu letakkan di:
   \`app/src/main/assets/index.html\`.
7. Hubungkan HP Poco atau Xiaomi melalui USB Debugging, lalu klik "Run 'app'" (Shift + F10).
8. Aplikasi akan langsung mengenali sensor IR Blaster fisik Poco dan dapat mengendalikan Smart TV Samsung, LG, Sony, Xiaomi, Polytron, TCL, Sharp, dll.!
`
};
