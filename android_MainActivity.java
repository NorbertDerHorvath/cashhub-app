
package com.cashbackhub;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        
        // Fontos beállítások a modern webalkalmazásokhoz
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Ez biztosítja, hogy az appon belül maradjon a navigáció
        webView.setWebViewClient(new WebViewClient());

        // IDE ÍRD A SAJÁT SZERVERED URL-JÉT:
        webView.loadUrl("https://a-te-szervered-urlje.hu");
    }

    // A hardveres vissza gomb kezelése
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
