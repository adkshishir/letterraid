module.exports = {
  apps: [
    {
      name: 'letterraid-frontend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        // 5003 — portfolio holds 5000, twofaced holds 5001/5002 on the same
        // box.
        PORT: 5003,

        // NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_BACKEND_URL deliberately live in
        // .env.production, not here. They're inlined into the client bundle at
        // BUILD time, and pm2's env only reaches the running server — setting
        // them here made a plain `npm run build` fall back to localhost, and the
        // deployed app then dialled the visitor's own machine. `next build` and
        // `next start` both read .env.production, so one file covers both.
        // Changing a domain still requires a rebuild, not just a pm2 restart.
      },
    },
  ],
};
