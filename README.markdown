# graphql-id-linter

According to apollo-client's [issue 2510](https://github.com/apollographql/apollo-client/issues/2510), the apollo client really, really wants you to include `id`s in every query that touches a type, so that it can maintain its cache.

In theory this is getting fixed in apollo-client 3.0-beta, but always returning id is probably not a bad idea anyway.

Credits, this is a ~80% copy/paste of [Cecchi](https://github.com/cecchi)'s solution on [this comment](https://github.com/apollographql/apollo-client/issues/2510#issuecomment-619081467).

## Install

```bash
npm install --save-dev @homebound/graphql-id-linter
```

Include it in your `graphql-codegen.yml`:

```yaml
schema: ./schema.json
documents: src/**/*.graphql
generates:
  src/generated/graphql-types.tsx:
    plugins:
      - "@homebound/graphql-id-linter"
```
