# RAPIMAX — Deployment & Operations Guide
## Logeek / Dev313 → Nacascolo Holdings

---

## 1. ARCHITECTURE SUMMARY

| Layer | Tech | Cost |
|-------|------|------|
| Frontend | Svelte 4 + Vite (7 pages) | $0 |
| Hosting | Cloudflare Pages (global CDN, auto-SSL) | $0 |
| API | Cloudflare Pages Functions (serverless) | $0 |
| Database | Cloudflare D1 (SQLite) | $0 |
| Email | Resend.com (100 emails/day free) | $0 |
| Domain | .cr or .com (annual) | ~$15-40/yr |

**Total monthly cost: $0** (free tier handles 100K requests/day)

---

## 2. DOMAIN PURCHASE

### Recommended domains (check availability):
- `rapimax.cr` — via NIC Costa Rica (nic.cr) ~$40/yr
- `rapimax.co.cr` — same registrar
- `rapimax.com` — via Namecheap/Cloudflare Registrar ~$12/yr
- `rapimaxcr.com` — fallback option

### Steps:
1. Buy domain via **Cloudflare Registrar** (cheapest, zero markup):
   - dash.cloudflare.com → Domain Registration → Register Domain
   - Or transfer an existing domain there
2. For `.cr` domains: register at **nic.cr** then add to Cloudflare DNS

---

## 3. DEPLOY TO CLOUDFLARE PAGES

### Prerequisites
```bash
npm install -g wrangler
wrangler login   # Opens browser to authenticate with Cloudflare
```

### Step A — Create D1 Database
```bash
wrangler d1 create rapimax-db
```
Copy the `database_id` from the output and paste it into `wrangler.toml`.

### Step B — Run Database Schema
```bash
wrangler d1 execute rapimax-db --remote --file=./db/schema.sql
```

### Step C — Deploy to Cloudflare Pages
```bash
# First time: create the project
wrangler pages project create rapimax

# Deploy
npm run build
wrangler pages deploy dist --project-name rapimax
```

### Step D — Connect GitHub for Auto-Deploy
1. Go to **dash.cloudflare.com** → Workers & Pages → rapimax → Settings → Builds
2. Connect GitHub → Select `jseevers208/rapimax-site`
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
4. Now every `git push` to `main` auto-deploys

### Step E — Add D1 Binding
1. In Cloudflare Dashboard → Workers & Pages → rapimax → Settings → Bindings
2. Add binding → D1 Database
   - Variable name: `DB`
   - D1 database: `rapimax-db`

### Step F — Set Environment Variables
In Settings → Environment Variables, add:
| Variable | Value | Notes |
|----------|-------|-------|
| `ADMIN_PASSWORD` | (choose a strong password) | For /admin login |
| `RESEND_API_KEY` | (from resend.com) | Optional — for email |
| `NOTIFICATION_EMAIL` | (Nacascolo team email) | Where to send alerts |
| `EMAIL_FROM` | `RapiMax <notificaciones@rapimax.cr>` | Sender address |
| `SITE_URL` | `https://rapimax.cr` | For email links |

### Step G — Custom Domain
1. Workers & Pages → rapimax → Custom Domains → Add
2. Enter your domain (e.g., `rapimax.cr`)
3. Cloudflare auto-provisions SSL and DNS

---

## 4. EMAIL NOTIFICATIONS (Resend)

1. Sign up at **resend.com** (free: 100 emails/day)
2. Add your domain → follow DNS verification
3. Copy API key → paste as `RESEND_API_KEY` env var
4. New loan applications and contact messages will email automatically

---

## 5. ADMIN PANEL

**URL:** `https://rapimax.cr/admin`
**Login:** Use the password set in `ADMIN_PASSWORD` env var

### Features:
- View all loan applications (solicitudes)
- View contact messages
- View calculator leads (email captures)
- Filter by status (nueva, en-proceso, aprobada, rechazada)
- Change application status via dropdown
- Export any view to CSV
- Paginated (25 per page)

---

## 6. CONTENT TO UPDATE BEFORE LAUNCH

These placeholder values in the code need real data from Nacascolo:

### In `src/ContactApp.svelte`:
- `CONTACT_PHONE_DISPLAY` → real phone number
- `CONTACT_PHONE_HREF` → real tel: link
- `WHATSAPP_URL` → real WhatsApp number

### In `src/lib/components/Footer.svelte`:
- Phone number (line 43)
- Email address (line 44)
- Social media URLs (lines 45-47) — real Facebook, Instagram, LinkedIn

### Missing pages to create:
- `/terminos-y-condiciones` — Terms and conditions page
- `/politica-de-privacidad` — Privacy policy page

---

## 7. POST-LAUNCH CHECKLIST

- [ ] Domain purchased and pointed to Cloudflare
- [ ] D1 database created and schema applied
- [ ] Cloudflare Pages project connected to GitHub
- [ ] D1 binding added (variable: DB)
- [ ] Environment variables set (ADMIN_PASSWORD, etc.)
- [ ] Resend account set up (optional but recommended)
- [ ] Placeholder content replaced (phone, WhatsApp, social links)
- [ ] Admin panel tested with real login
- [ ] Form submissions tested end-to-end
- [ ] Mobile responsiveness verified
- [ ] Google Search Console configured
- [ ] Google Analytics or Cloudflare Web Analytics added

---

## 8. MAINTENANCE

### Updating content:
Edit files in the repo → `git push` → auto-deploys in ~30 seconds

### Viewing data:
- Admin panel at `/admin`
- Or query D1 directly: `wrangler d1 execute rapimax-db --remote --command "SELECT * FROM loan_applications ORDER BY created_at DESC LIMIT 10"`

### Backups:
D1 has automatic point-in-time recovery. For manual CSV backups, use the Export button in the admin panel.

---

*Document: Logeek/Dev313 — May 2026*
*Contact: Growth@onvopay.com*
