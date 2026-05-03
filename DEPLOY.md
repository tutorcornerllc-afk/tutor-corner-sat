# Deploy SAT app to tutorcornerllc.com/SAT

**End goal:** iPhone & Android users go to `tutorcornerllc.com/SAT`, tap "Add to Home Screen," and get a full-screen app with your logo, splash, and all 16 games — no App Store, no fees.

You'll do three things, in order: **GitHub** → **Cloudflare** → **Squarespace DNS**.
Estimated time: 30–45 min the first time.

---

## 1. GitHub: create the repo & push the code

1. Go to https://github.com/new
2. Repository name: `tutor-corner-sat` (matches what's in `cloudflare-worker.js`)
3. Set to **Public** (free GitHub Pages requires public repos)
4. Don't tick "Add a README" — we already have one
5. Click **Create repository**

GitHub will show you commands. From your `C:\Users\nealc\SATApp` folder, in PowerShell or Command Prompt:

```powershell
cd C:\Users\nealc\SATApp
git add .
git commit -m "Add web build config + PWA manifest + GitHub Actions deploy"
git branch -M master
git remote add origin https://github.com/YOUR-USERNAME/tutor-corner-sat.git
git push -u origin master
```

Replace `YOUR-USERNAME` with your actual GitHub username.

**What happens next:** the GitHub Action in `.github/workflows/deploy.yml` automatically builds the Expo web export and pushes it to a `gh-pages` branch. You don't run any build commands locally — GitHub does it for you.

Watch the build at: `https://github.com/YOUR-USERNAME/tutor-corner-sat/actions`

It takes ~3–5 minutes the first time. When it's green, the `gh-pages` branch will exist.

### Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `(root)`
3. Click **Save**

After ~1 minute, your app is live at `https://YOUR-USERNAME.github.io/tutor-corner-sat/SAT/`.
Open it on your phone to verify — every game should work.

> If you see a blank screen, open browser DevTools → Console and check for errors. The most common issue is icons not loading; check that the `public/` folder was committed.

---

## 2. Cloudflare: route /SAT to GitHub

This is what makes `tutorcornerllc.com/SAT` work instead of the github.io URL.

### 2a. Sign up + add your domain (free plan)

1. https://dash.cloudflare.com/sign-up — make a free account
2. Click **Add a site**, enter `tutorcornerllc.com`
3. Pick the **Free** plan ($0/mo)
4. Cloudflare will scan your existing DNS records — let it finish (30 sec)

### 2b. Copy your existing Squarespace DNS

Cloudflare will show a list of DNS records it found. **Verify these exist** — they should auto-import, but double-check:

| Type  | Name | Value | Proxy |
|-------|------|-------|-------|
| A     | tutorcornerllc.com | (Squarespace IP — auto-imported) | DNS only |
| A     | tutorcornerllc.com | (Squarespace IP — auto-imported) | DNS only |
| CNAME | www  | ext-cust.squarespace.com | DNS only |

Set **Proxy status to "DNS only"** (gray cloud) for these, so Cloudflare doesn't interfere with Squarespace's SSL.

If any are missing, get the actual values from Squarespace (Settings → Domains → tutorcornerllc.com → DNS Settings) and add them.

### 2c. Change nameservers at Squarespace

Cloudflare will show two nameserver names like `kim.ns.cloudflare.com` and `walt.ns.cloudflare.com`. Copy them.

In Squarespace: **Settings → Domains → tutorcornerllc.com → Advanced Settings → Nameservers** → choose **Use Custom Nameservers** → paste the two Cloudflare nameservers → Save.

> ⚠️ DNS propagation takes 5 min – 24 hours. Cloudflare will email you when it's active. Your existing site won't go down because the DNS records were copied over.

### 2d. Create the Worker

Once Cloudflare confirms your domain is active:

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker** → name it `sat-app-router` → Deploy
2. After deploy, click **Edit code**
3. Delete everything in the editor
4. Open `cloudflare-worker.js` (in this project root), copy the contents, paste into the editor
5. **Edit the two constants at the top:**
   - `GH_USER` → your GitHub username
   - `GH_REPO` → `tutor-corner-sat` (or whatever you named the repo)
6. Click **Deploy**

### 2e. Map the Worker to /SAT

1. Still in your Worker → **Settings** tab → **Domains & Routes** → **Add** → **Route**
2. Zone: `tutorcornerllc.com`
3. Route: `tutorcornerllc.com/SAT*`  (the `*` is important — it catches `/SAT`, `/SAT/`, `/SAT/anything`)
4. Save

That's it. Wait ~30 seconds, then visit **https://tutorcornerllc.com/SAT** — you should see the SAT app.

---

## 3. Squarespace: leave it alone

You don't need to change anything in Squarespace beyond the nameserver swap. Your main site at `tutorcornerllc.com` keeps working exactly as before, because:

- Cloudflare passes everything that isn't `/SAT*` straight through to Squarespace.
- Squarespace still serves your homepage, blog, etc.

---

## How users install the app on their phone

**iPhone (Safari):**
1. Visit `tutorcornerllc.com/SAT`
2. Tap the Share button (square with arrow)
3. Tap **Add to Home Screen**
4. The app appears on the home screen with your logo. Tapping it opens full-screen with no Safari chrome — exactly like a native app.

**Android (Chrome):**
1. Visit `tutorcornerllc.com/SAT`
2. Chrome shows a banner: "Add Tutor Corner SAT Prep to Home screen" — tap it
3. (Or menu → "Install app")

**Desktop:**
1. Visit `tutorcornerllc.com/SAT`
2. Chrome/Edge shows an install icon in the address bar
3. Click → app opens in its own window

---

## Updating the app

Just push to GitHub. The Action rebuilds and redeploys automatically:

```powershell
cd C:\Users\nealc\SATApp
git add .
git commit -m "Update games"
git push
```

3–5 min later the new version is live at `tutorcornerllc.com/SAT`.

> Note: PWAs cache aggressively. Users may need to close & reopen the home-screen app to get the latest version.

---

## What won't work in the web version (vs native)

- **Push notifications** — disabled on web (the daily 8 AM / 8 PM reminders are mobile-only). Browser push is possible later but needs separate setup.
- **In-app purchases** — `react-native-purchases` is installed but unused, so no impact. Web payments would go through Stripe or your existing Squarespace flow.
- **Haptic feedback** — disabled on web (no vibration API on iOS Safari). Already gated by `process.env.EXPO_OS === 'ios'`.

Everything else (games, sounds, XP, streaks, badges, daily challenges, access codes, Google Sheets sync) works identically.

---

## Troubleshooting

**Build fails in GitHub Actions** → click the failed run, expand the "Build static web export" step, read the error. Most common: TypeScript error in a file you edited; fix locally and push again.

**`/SAT` shows GitHub 404** → the `gh-pages` branch hasn't been created yet. Check the Actions tab — the first build might still be running.

**`/SAT` shows the app but assets are missing** → Cloudflare Worker has wrong `GH_USER` or `GH_REPO`. Re-edit and redeploy the Worker.

**Site root broke after Cloudflare swap** → DNS records didn't import correctly. Go to Cloudflare DNS tab, compare against Squarespace's DNS settings, fix any missing records.
