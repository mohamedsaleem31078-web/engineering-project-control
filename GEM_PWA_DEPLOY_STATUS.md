# GEM V6 Classic — isolated deployment staging

This branch is reserved for the **privacy-sanitized** GEM Classic Offline PWA.

The full source-ready release archive was assembled and verified as `GEM_V6_Classic_PWA_Validated_Release_Kit.zip` in the ChatGPT project session, but **is not yet in this repository**. Do not deploy until all source files are uploaded.

Required acceptance: build with pinned `pdfjs-dist@4.10.38` and matching worker, run real Chromium E2E testing of a two-page PDF, photo, pin placement and offline reloading, then publish only if all tests pass.

## Privacy gate
Never commit or publish Grand Egyptian Museum drawings, 12K tiled maps, real site photos, snag records or demo data. Static hosting must include source only; actual project information is saved locally in the user's browser. A public GitHub Pages website is not access-controlled.

## Deployment status
- Source bundle prepared locally: yes
- Source files in repository: **no**
- CI PDF test passed: **not yet**
- GitHub Pages HTTPS published: **no**
- Windows/Android installed PWA tested: **no**

After uploading the archive **contents**, the release workflow can perform CI.