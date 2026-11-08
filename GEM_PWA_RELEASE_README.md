# GEM V6 Classic — PWA deployment (work in progress)

This is a **privacy-safe staging branch**. The full clean source package has been prepared separately as **GEM_V6_Classic_PWA_Gated_Release.zip**, but the complete application source has not been transferred to this branch.

## Release gates
1. Import the **complete clean source package**, not the site/project or demo data.
2. The workflow obtains **pdfjs-dist@4.10.38** and the matching worker during GitHub Actions build.
3. The workflow must build the sanitized `dist/` and pass a real Playwright browser test: PDF two pages → one photo and one pin → save → offline reload.
4. Only then merge into `main` and deploy via GitHub Pages with HTTPS.
5. Validate PWA installation and offline cold start on actual Windows Edge/Chrome.

## Privacy warning
Even if the repository is private, GitHub Pages may make the hosted website publicly accessible. **Never commit drawing plans, genuine snag photos, issue records, or private schedule information.** User-created data resides locally in browser IndexedDB, requiring regular portable ZIP backups.

## Actual status
**Not published; no live URL or successful E2E deployment has been verified.**
