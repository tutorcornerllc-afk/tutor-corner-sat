// Cloudflare Worker for routing tutorcornerllc.com/SAT/* to GitHub Pages.
//
// HOW TO USE:
//   1. In Cloudflare dashboard, go to Workers & Pages → Create → Hello World worker
//   2. Replace the default code with this file's contents
//   3. Edit GH_USER and GH_REPO constants below to match your GitHub
//   4. Save & deploy
//   5. Add a route: tutorcornerllc.com/SAT*  →  this worker
//      (Workers → your worker → Settings → Triggers → Add Custom Domain/Route)
//
// What it does:
//   tutorcornerllc.com/SAT/foo  →  fetched from <GH_USER>.github.io/<GH_REPO>/SAT/foo
//   The "/SAT" path is preserved end-to-end so all the in-app links keep working.
//   tutorcornerllc.com (and everything else) is left alone — Cloudflare passes it
//   through to Squarespace as normal.

const GH_USER = 'YOUR-GITHUB-USERNAME';   // <-- change me
const GH_REPO = 'tutor-corner-sat';       // <-- change me to match repo name

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only handle the /SAT path. Everything else falls through to origin (Squarespace).
    if (!url.pathname.startsWith('/SAT')) {
      return fetch(request);
    }

    // Translate the request to the GitHub Pages URL.
    // GitHub Pages for a project repo is served at:
    //   https://<user>.github.io/<repo>/...
    // Our app is built with baseUrl="/SAT", so files live under:
    //   https://<user>.github.io/<repo>/SAT/...
    const targetUrl = `https://${GH_USER}.github.io/${GH_REPO}${url.pathname}${url.search}`;

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    // If GitHub Pages 404s on a sub-route (e.g. /SAT/wordduel after a refresh),
    // serve the SPA's index so client-side routing can take over.
    if (upstream.status === 404) {
      const fallback = await fetch(`https://${GH_USER}.github.io/${GH_REPO}/SAT/index.html`);
      return new Response(fallback.body, {
        status: 200,
        headers: fallback.headers,
      });
    }

    return upstream;
  },
};
