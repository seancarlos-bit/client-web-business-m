# Vanguard Studio — Production Deployment Shipping Gate & Checklist

A strict operational, technical, and compliance gate that must be validated before pointing live client DNS or publishing any Vanguard digital flagship to production.

---

## 🛑 Critical Pre-Flight Configuration Placeholders

> **MANDATORY POLICY**: *Never invent or publish mock production data. Every item below must be updated with verified client data prior to production deployment.*
> **MECHANICAL RELEASE GATE**: Running `.\build.ps1 -Mode Production` will automatically abort and block the build if any placeholder below remains in source files.

| Placeholder | File Reference | Description / Required Real-World Value | Deployment Status |
|---|---|---|:---:|
| `__CANONICAL_URL__` | `index.html`, `robots.txt`, `sitemap.xml` | Live production HTTPS domain (e.g., `https://vanguardstudio.com`). | ⚠️ PENDING LAUNCH DOMAIN |
| `__YOUR_FORM_ID__` | `index.html`, `js/form.js` | Real endpoint ID from Formspree (`https://formspree.io/f/xyza...`) or Web3Forms access key. | ⚠️ PENDING ENDPOINT SETUP |
| `__PHONE_NUMBER__` | `index.html` (JSON-LD schema) | Verified business direct dial in E.164 format (e.g., `+1-555-123-4567`). | ⚠️ PENDING CLIENT PHONE |
| `__CITY__` | `index.html` (JSON-LD schema) | Primary locality / market municipality (e.g., `Phoenix`). | ⚠️ PENDING CLIENT LOCATION |
| `__STATE__` | `index.html` (JSON-LD schema) | Primary state abbreviation (e.g., `AZ`). | ⚠️ PENDING CLIENT STATE |
| `assets/og-image.jpg` | `assets/` directory | 1200 × 630 px branded social sharing preview graphic. | ⚠️ PENDING GRAPHIC ASSET |

---

## 🔒 Strict HSTS Deployment Protocol & Prerequisites

Do not blindly enable `includeSubDomains` or `preload` before confirming live domain topology. Follow this phased rollout:

1. **Step 1: Domain Ownership & TLS Verification**
   - Confirm apex domain and `www` resolve with valid, auto-renewing SSL certificates.
   - Verify all URLs redirect to `https://`.
2. **Step 2: Subdomain Inventory**
   - Audit all active subdomains (e.g., `api.`, `staging.`, `mail.`).
   - If any subdomain does not support HTTPS, **do NOT enable `includeSubDomains`**.
3. **Step 3: Initial Low-TTL HSTS**
   - Start with: `Strict-Transport-Security: max-age=300;` (5 minutes) in edge configuration.
   - Test for 48 hours to confirm zero connection failures.
4. **Step 4: Production HSTS**
   - Elevate to: `Strict-Transport-Security: max-age=31536000;` (1 year).
   - Add `includeSubDomains` only after all subdomains are proven HTTPS-compliant.
   - Submit to HSTS preload list (`hstspreload.org`) only as a final, permanent commitment.

---

## 📋 The 20-Point Reusable Vanguard Shipping Gate

Before launching, check every box and obtain sign-off:

### 1. Build & Public Boundary Integrity
- [ ] **Isolated `dist/` Output**: Production assets built exclusively into `dist/` via `.\build.ps1`.
- [ ] **Internal Documents Excluded**: Verified that `DESIGN.md`, `HANDOFF.md`, `COMPLETE_ROADMAP_GUIDE.md`, `VIBECODED_SAAS_EXIT_PLAYBOOK.md`, `contracts/`, `references/`, `bin/`, `css/`, and `build.ps1` are NOT in `dist/`.
- [ ] **Public Links Sanitized**: Verified that `index.html` footer contains zero links to internal markdown files.
- [ ] **Asset Fingerprinting**: Verified that CSS and JS in `dist/` use content hashes (`assets/site.[hash].css`, `js/*.[hash].js`).
- [ ] **Cache Versioning**: Hashed assets served with `max-age=31536000, immutable`; HTML served with `max-age=0, must-revalidate`.
- [ ] **Zero Play CDN**: Verified zero requests to `cdn.tailwindcss.com`.

### 2. Form & Lead Routing Integrity
- [ ] **Real Form Endpoint Configured**: `action` attribute points to active client Formspree/Web3Forms endpoint.
- [ ] **Zero Placeholder Success Behavior**: Form does not simulate success; displays clear deployment warning while placeholders remain.
- [ ] **End-to-End Test Lead Verified**: A real test submission was sent from the staging site and confirmed received in client inbox.
- [ ] **Anti-Spam Active**: Honeypot field (`_gotcha`) verified hidden and functional.

### 3. Runtime, Network & Security Headers
- [ ] **Restrictive Production CSP Enforced**: Verified `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://api.web3forms.com; form-action 'self' https://formspree.io https://api.web3forms.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`.
- [ ] **Zero CSP Violations**: Zero CSP-related console warnings or blocked requests under active policy enforcement.
- [ ] **Edge Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` active.
- [ ] **Custom 404 Page**: Branded, accessible `dist/404.html` deployed and verified on missing routes.

### 4. Accessibility & Mobile Responsiveness
- [ ] **Keyboard Navigation**: Full page navigable via `Tab` key with prominent visible focus states.
- [ ] **Skip Link**: Accessible skip-to-main-content link functional.
- [ ] **Touch Targets**: All interactive elements meet or exceed 44px minimum height.
- [ ] **200% Zoom Resilient**: Verified zero horizontal layout overflow at 200% display scaling.
- [ ] **Motion Governor**: Reduced motion disables pointer tilts and canvas particles cleanly.
- [ ] **Zero Horizontal Scroll**: Verified across 360px, 414px, 768px, 1280px, and 1920px viewports.

---

## 🛠️ Build & Deployment Runbook

### Preview Build (Default)
Generates `dist/` with staging indexing protection (`noindex, nofollow` in `dist/index.html` and `robots.txt` Disallow: /):
```powershell
.\build.ps1 -Mode Preview
```

### Production Build (Release Gate)
Fails automatically if any placeholders remain unresolved in source files:
```powershell
.\build.ps1 -Mode Production
```

### Edge Host Deployment
- **Vercel**: Set `outputDirectory: "dist"` in `vercel.json` (configured).
- **Netlify**: Set `publish = "dist"` in `netlify.toml` (configured).
