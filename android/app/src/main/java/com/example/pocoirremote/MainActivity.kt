package com.example.pocoirremote

import android.annotation.SuppressLint
import android.content.Context
import android.hardware.ConsumerIrManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity untuk membungkus antarmuka web Multi-Brand Universal IR Remote & QWERTY Keyboard
 * dan menghubungkannya secara native dengan modul IR Blaster fisik Poco / Xiaomi via ConsumerIrManager.
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

        if (irManager == null || !irManager!!.hasIrEmitter()) {
            Log.w(TAG, "Hardware IR Blaster tidak terdeteksi di perangkat ini.")
            Toast.makeText(
                this,
                "Peringatan: Sensor IR Blaster fisik tidak terdeteksi di HP ini.",
                Toast.LENGTH_LONG
            ).show()
        } else {
            Log.i(TAG, "Hardware IR Blaster Poco/Xiaomi siap digunakan!")
        }

        webView = findViewById(R.id.webView)
        setupWebView()

        // Muat antarmuka dari assets lokal offline
        webView.loadUrl("file:///android_asset/index.html")
    }

    @SuppressLint("SetJavaScriptEnabled")
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
            cacheMode = WebSettings.LOAD_DEFAULT
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
                Log.d(TAG, "Remote Web UI berhasil dimuat di WebView.")
            }
        }
    }

    class AndroidIRBridge(
        private val context: Context,
        private val irManager: ConsumerIrManager?
    ) {

        @JavascriptInterface
        fun hasIrEmitter(): Boolean {
            return irManager?.hasIrEmitter() == true
        }

        @JavascriptInterface
        fun transmitIR(frequency: Int, patternString: String): Boolean {
            return try {
                if (irManager == null || !irManager.hasIrEmitter()) {
                    Log.e(TAG, "Gagal transmit: Hardware IR Blaster tidak tersedia.")
                    return false
                }

                // Parse deretan pulsa mikrodetik menjadi IntArray
                val pattern = patternString.split(",")
                    .map { it.trim().toInt() }
                    .toIntArray()

                // Transmisi via Android ConsumerIrManager fisik
                irManager.transmit(frequency, pattern)
                Log.d(TAG, "Transmit IR sukses: freq=$frequency Hz, pulsa=${pattern.size} elemen.")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Kesalahan saat transmisi IR: ${e.message}", e)
                false
            }
        }

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
                Log.w(TAG, "Gagal haptic: ${e.message}")
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
}
