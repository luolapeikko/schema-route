---
name: schema-route
description: Use the @luolapeikko/schema-route package when building shared client and backend routes with strict schema validation.
---

# Schema Route

## Purpose

The purpose of the `@luolapeikko/schema-route` package is to provide a unified way to define and validate routes for both client and backend applications. It ensures that route definitions are consistent and type-safe, reducing the risk of runtime errors and improving developer productivity.

## Important conventions

- Use `createSchemaRoute(reqHandler, router, buildPath, response, method)` to define a typed route contract. All five arguments are required; the supported methods are `GET`, `POST`, `PUT`, `DELETE`, and `PATCH`.
- Define request schemas with the `body`, `params`, and `query` keys using schemas compatible with Standard Schema V1. Zod is used in examples and tests, but the library is not tied to Zod.
- `InferStandard<T>` represents caller-provided schema **input** types. Keep client inputs and `buildPath` parameters based on those input types, especially when a schema transforms its input into a different output type.
- Keep the router path and path builder consistent. The router path uses colon-prefixed parameter names (such as `:id`), and its type requires the names inferred from the `params` schema. The `buildPath` callback receives those inferred parameters and returns the client path.
- Use `resolvePath` when resolving a path with optional parameters, and `createURLSearchParams` to serialize query inputs. These helpers are exported from the package entry point.
- The response schema determines the inferred response output type. The `response` property is required on a route, though its value may be `undefined`.
- Treat this package as a route-contract and typing library, not an HTTP client, server, or validation middleware. Keep framework-specific request handling in adapters and avoid adding framework dependencies to the core package.
- buildPath does handle only the path parameters inferred from the `params` schema. Optional query parameters should be serialized separately using `createURLSearchParams` on client api setup.

## Usage patterns

### GET routes

This is GET route example with a path parameter `id` and returns an object with a `name` property.
```typescript
createSchemaRoute(
  {params: z.object({id: z.string().transform(Number)})},
  '/api/:id',
  ({id}) => `/api/${id}`,
  z.object({name: z.string()}),
  'GET',
);
```

### POST routes

This is a POST route example with a request body containing a `name` property and returns an object with a `name` property.
```typescript
createSchemaRoute(
  {body: z.object({name: z.string()})},
  '/api/basic',
  (_) => `/api/basic`,
  z.object({name: z.string()}),
  'POST',
);
```

### GET with query parameters

This is a GET route example with query parameters containing a `search` property and returns an object with a `results` property.
On this actual api caller function need to use `const queryParams = createURLSearchParams(input.query);` to serialize the query parameters to actual URL.
```typescript
createSchemaRoute(
  {query: z.object({search: z.string()})},
  '/api/search',
  () => `/api/search`,
  z.object({results: z.array(z.string())}),
  'GET',
);
```