# Tooling policy

## Package manager

The project intentionally remains on Yarn 3.6.1 for this modernization cycle.

Reasons:

- the repository already commits the Yarn 3 binary and lockfile;
- moving package managers while upgrading framework/content/styling would add unnecessary migration risk;
- CI uses the same pinned Yarn version.

A future package-manager upgrade can be evaluated independently.

## Local quality commands

```bash
yarn typecheck
yarn lint
yarn format:check
yarn build
```

## Git hooks

Husky runs `lint-staged` before commits. Staged TypeScript/JavaScript files are linted and supported source/content files are formatted with Prettier.
