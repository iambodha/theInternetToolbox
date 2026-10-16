# The Internet Toolbox

A browser-based collection of everyday utilities: manipulate PDFs, transform text, resize images, run small calculations, and try reaction/memory games. Built with Next.js, React, and TypeScript, then statically exported to GitHub Pages.

**[Open the deployed app →](https://iambodha.github.io/theInternetToolbox/)**

Try [Text Formatter](https://iambodha.github.io/theInternetToolbox/text-tools/formatter/), [PDF Merger](https://iambodha.github.io/theInternetToolbox/pdf-tools/merge/), or [Image Resizer](https://iambodha.github.io/theInternetToolbox/image-tools/resizer/). Use the homepage search or **⌘K / Ctrl+K** to find a tool. Changes in a pull request reach the deployed app after merging and a successful Pages deployment.

## Run locally

Node.js 22.18+ and npm. The application lives in `frontend/`.

```sh
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. No API keys or backend service are required for the core text/PDF/image utilities. OCR and some processing libraries may fetch their worker/model assets; individual tools also depend on browser APIs.

```sh
npm test            # text-operation regression tests
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # production static export in out/
npm run serve      # preview the exported site
```

Geist and Geist Mono are bundled locally under the SIL Open Font License, so builds do not download fonts from Google. GitHub Actions builds with the `/theInternetToolbox` base path; local development uses `/`.

## What's inside

| Area | Examples | Implementation |
| --- | --- | --- |
| Documents | Merge, split, rotate, watermark, OCR | `pdf-lib`, PDF.js, Tesseract.js |
| Text | Case conversion, cleanup, comparison, encoding | React components and local text operations |
| Images | Resize, optimize, pixelify, palette extraction | Canvas and browser file APIs |
| Video | Trim, rotate, speed, frame extraction | Browser media APIs; format support varies |
| Benchmarks | Reaction time, typing, memory, aim | Client-side interactions |
| Calculators | Chemistry, physics, investment scenarios | Client-side calculations and Recharts |
| File testing | Intentionally invalid fixture generation | Upload-validation and error-handling experiments |

The collection is a personal project with varying tool maturity. File conversion coverage depends on the selected input/output formats; a route in the catalog does not imply every format combination is supported. Scientific and investment calculators are illustrative tools with assumptions in their implementation, rather than validated professional software.

## Architecture

- `frontend/src/app/`: Next.js App Router pages, category routes, and older standalone routes.
- `frontend/src/components/`: Tool implementations grouped by category, plus shared UI.
- `frontend/src/contexts/ThemeContext.tsx`: Light, dark, and system theme preferences.
- `frontend/src/lib/pdf-utils/`: Shared PDF operations.
- `frontend/src/lib/text-format.ts`: Pure formatting operations with regression tests.
- `.github/workflows/check.yml`: Tests, lint, types, and static build for changes.
- `.github/workflows/nextjs.yml`: Production deployment from `main` to Pages.

There is no application database or account system. Many file operations run in the browser; inspect a tool's dependencies before assuming it works offline. Browser memory limits can affect large files, especially video and OCR. Files and text are not persisted by the formatter.

## Validation

Automated formatter tests cover punctuation and existing identifiers, accented letters, emoji/combining-mark reversal, CRLF input, paragraph preservation, and invalid operations. Lint, type checking, and the static export cover the whole application. They do not certify every calculator, file format, or browser.

For a UI change, check the affected tool on desktop and mobile, try an empty input and a real small fixture, and confirm both successful output and a recoverable error. Keep labels, result state, and copy/download feedback consistent.

## License

[Apache License 2.0](LICENSE). Bundled fonts retain their [SIL Open Font License](frontend/src/app/fonts/LICENSE.txt); third-party libraries retain their respective licenses.
