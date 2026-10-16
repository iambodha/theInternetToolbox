# Toolbox frontend

The Next.js application for [The Internet Toolbox](../README.md). See the root README for the project overview, live demo, architecture, and validation scope.

Requires Node.js 22.18+ and npm.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
npm run serve
```

Development runs at `http://localhost:3000`; the production export goes to `out/`. GitHub Actions sets the `/theInternetToolbox` base path for Pages. Keep the build and dev server in separate checkouts if running them simultaneously, since both use `.next/`.
