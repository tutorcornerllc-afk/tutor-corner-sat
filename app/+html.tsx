import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every
 * web page during static rendering.
 * The contents of this function only run in Node.js environments and
 * do not have access to the DOM or browser APIs.
 */
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

        {/* SEO */}
        <title>Tutor Corner LLC® - SAT® Prep Games</title>
        <meta
          name="description"
          content="Free SAT® prep mini-games from Tutor Corner LLC. 16 quick games to train your brain."
        />
        <meta name="theme-color" content="#0F0F1A" />

        {/* PWA manifest */}
        <link rel="manifest" href="/SAT/manifest.json" />

        {/* Favicons */}
        <link rel="icon" type="image/png" href="/SAT/favicon.ico" />

        {/* iOS — Add to Home Screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SAT Prep" />
        <link rel="apple-touch-icon" href="/SAT/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/SAT/apple-touch-icon.png" />

        {/* iOS splash — points to Expo splash so the home-screen launch shows your splash image */}
        <link rel="apple-touch-startup-image" href="/SAT/splash.png" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Locks the page to dark backgrounds + prevents pull-to-refresh / overscroll bounce that breaks the app feel */}
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
