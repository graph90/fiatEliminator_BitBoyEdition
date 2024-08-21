package com.game.fiateliminator

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize the WebView and load the HTML5 game
        webView = WebView(this)
        webView.settings.apply {
            javaScriptEnabled = true // Enable JavaScript if needed
            domStorageEnabled = true  // Enable DOM storage API
            allowFileAccess = true    // Allow file access if loading from local assets
            setSupportZoom(true)     // Enable zoom controls
            builtInZoomControls = true
            displayZoomControls = false // Hide zoom controls
            loadWithOverviewMode = true // Fit content to screen width
            useWideViewPort = true    // Enable viewport scaling
        }

        webView.webViewClient = WebViewClient() // Handle page navigation within the WebView

        // Load your HTML5 game (from assets or URL)
        webView.loadUrl("file:///android_asset/index.html") // if local file
        // webView.loadUrl("https://your-game-url.com") // if remote URL

        setContentView(webView)
    }

    override fun onBackPressed() {
        // Allow navigating back within WebView, if possible
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
