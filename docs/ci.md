# Continuous integration

The `CI` workflow runs on every pull request and on pushes to `main`.

## Quality gate

The workflow validates:

1. immutable Yarn install;
2. production Next.js build;
3. Contentlayer2 generation;
4. tag-data generation;
5. local search-index generation;
6. RSS generation;
7. TypeScript;
8. ESLint;
9. Prettier.

The same commands can be run locally:

```bash
yarn install --immutable
yarn build
yarn verify:generated
yarn typecheck
yarn lint
yarn format:check
```
