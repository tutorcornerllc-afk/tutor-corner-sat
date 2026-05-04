import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <title>CornerMind</title>
        <meta
          name="description"
          content="CornerMind from Tutor Corner - 16 quick brain-training games. Free daily challenges. Installable web app, no App Store needed."
        />
        <meta name="theme-color" content="#0F0F1A" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicons */}
        <link rel="icon" type="image/png" href="/favicon.ico" />

        {/* iOS — Add to Home Screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CornerMind" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        <link rel="apple-touch-startup-image" href="/splash.png" />

        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: "if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function(e){ console.warn('SW failed', e); }); }); }" }} />

        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
  html, body {
    background-color: #0F0F1A;
    overscroll-behavior: none;
  }
  body {
    -webkit-tap-highlight-color: transparent;
  }
  @media (prefers-color-scheme: dark) {
    html, body {
      background-color: #0F0F1A;
    }
  }
`;
