![Repolith](readme.png)

# Repolith

Built for Humans. Ready for Agents.

Canonical production URL: [repolith.my.id](https://repolith.my.id) (deployment pending).

## Why

Repolith offers a different way to work with GitHub, from repository overviews and PR reviews to issue triage and the Ghost assistant.

## Features

- **Repo overview** — cleaner layout with README rendering, file tree, activity feed
- **PR reviews** — inline diffs, AI-powered summaries, review comments
- **Issue management** — triage, filter, and act on issues faster
- **Ghost (AI assistant)** — review PRs, navigate code, triage issues, write commit messages (`⌘I` to toggle)
- **Command center** — search repos, switch themes, navigate anywhere (`⌘K`)
- **CI/CD status** — view workflow runs and compare across branches
- **Security advisories** — track vulnerabilities per repo
- **Keyboard-first** — most actions accessible via shortcuts
- **Browser extension** — redirects supported GitHub pages to Repolith (Chrome and Firefox)

## Development

Use Node.js 22, Bun 1.4.2, and Docker. Create a [GitHub OAuth App](https://github.com/settings/developers) for local sign-in. Its local callback is `http://localhost:3000/api/auth/callback/github`.

```bash
git clone https://github.com/centrys-labs/repolith.git
cd repolith
cp apps/web/.env.example apps/web/.env
docker compose up -d
bun install --frozen-lockfile
cd apps/web && bunx prisma migrate dev && bunx prisma generate && cd ../..
bun dev
```

Fill in the required credentials and the local PostgreSQL connection string in `apps/web/.env` before starting. See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete setup, and [the domain cutover checklist](docs/domain-migration.md) for production configuration.

Run `bun check` for lint, formatting, and types; `bun run --cwd apps/web test --run` for Vitest; and `SKIP_ENV_VALIDATION=true bun run build` for a production build without local deployment credentials. The Bun workspace contains the Next.js app in `apps/web`, Prisma schema and migrations in `apps/web/prisma`, and the Chrome and Firefox extensions in `packages/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, PR workflow, and code style guidelines.

## License

[MIT](LICENSE)
