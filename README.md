# @luolapeikko/schema-route

A TypeScript library for creating HTTP API schema objects "contracts" that define the structure of requests and responses.

This uses `@standard-schema/spec` for defining and validating the structure of request and response schemas. (example uses `zod` but any compatible schema library can be used)

This library does not handle HTTP requests or responses and is not intended to provide a complete RPC setup. It only defines schemas for API calls, which can be further consumed on both the client and server.

Note: This library have some similar types with `@luolapeikko/express-standard-schema`, but this does not depend on Express.js types. It can therefore also be used in frontend or shared code.

## Schema Construction

```typescript
const authRoute = createSchemaRoute(
	{
		body: z.object({ username: z.string(), password: z.string() }),
	},
	"/api/auth",
	(_) => `/api/auth`,
	z.object({ token: z.string() }),
	"POST",
);

const queryRoute = createSchemaRoute(
	{
		query: z.object({ id: z.string() }),
	},
	"/api/query",
	(_) => `/api/query`,
	z.object({ result: z.string() }),
	"GET",
);

const updateRoute = createSchemaRoute(
	{
		body: z.object({ name: z.string() }),
		params: z.object({ id: z.string() }),
	},
	"/api/update/:id",
	({ id }) => `/api/update/${id}`,
	z.object({ success: z.boolean() }),
	"PUT",
);
```

### Example: API client

```typescript
import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
	createURLSearchParams,
	type InferStandard,
	resolvePath,
	type SchemaRoute,
	type StandardMiddlewareObject,
	type StandardOutputInfer,
} from "@luolapeikko/schema-route";

export async function schemaApiCall<
	T extends StandardMiddlewareObject,
	Out extends StandardSchemaV1<any, any> | undefined,
	R extends string,
>(
	schema: SchemaRoute<T, Out, R>,
	input: InferStandard<T>,
): Promise<StandardOutputInfer<Out>> {
	const hasBody = "body" in input;
	const queryParams = createURLSearchParams(input.query);
	const query = queryParams ? `?${queryParams.toString()}` : "";
	const res = await fetch(
		`http://localhost:${process.env.HTTP_PORT}${resolvePath(schema.buildPath, input.params)}${query}`,
		{
			method: schema.method,
			headers: hasBody ? { "content-type": "application/json" } : undefined,
			body: hasBody ? JSON.stringify(input.body) : undefined,
		},
	);
	if (!res.ok) {
		throw new Error(`Request failed with status ${res.status}`);
	}
	// Validate the response only when a response schema is defined.
	if (schema.response) {
		const schemaRes = await schema.response["~standard"].validate(
			await res.json(),
		);
		if (schemaRes.issues) {
			throw new Error(`Validation failed: ${JSON.stringify(schemaRes.issues)}`);
		}
		return schemaRes.value;
	}
	return undefined as StandardOutputInfer<Out>;
}
// Example use of the API call.
const result = await schemaApiCall(authRoute, {
	body: { username: "user", password: "pass" },
});
```

### Example: Express.js route registration with `@luolapeikko/express-standard-schema` middleware validation

```typescript
import {
	type StandardBodyOutInfer,
	type StandardParamsOutInfer,
	type StandardQueryOutInfer,
	validateRequestHandler,
} from "@luolapeikko/express-standard-schema";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type express from "express";
import type { RequestHandler } from "express";
import type {
	SchemaRoute,
	StandardMiddlewareObject,
	StandardOutputInfer,
} from "@luolapeikko/schema-route";

export function schemaRoute<
	T extends StandardMiddlewareObject,
	Out extends StandardSchemaV1<any, any> | undefined,
	R extends string,
>(
	app: express.Application,
	schema: SchemaRoute<T, Out, R>,
	handler: RequestHandler<
		StandardParamsOutInfer<T>,
		StandardOutputInfer<Out>,
		StandardBodyOutInfer<T>,
		StandardQueryOutInfer<T>
	>,
): void {
	switch (schema.method) {
		case "GET":
			app.get(schema.router, validateRequestHandler(schema, handler));
			break;
		case "POST":
			app.post(schema.router, validateRequestHandler(schema, handler));
			break;
		case "PUT":
			app.put(schema.router, validateRequestHandler(schema, handler));
			break;
		case "DELETE":
			app.delete(schema.router, validateRequestHandler(schema, handler));
			break;
		case "PATCH":
			app.patch(schema.router, validateRequestHandler(schema, handler));
			break;
		default:
			throw new Error(`Unsupported method: ${schema.method satisfies never}`);
	}
}
// Example use of the schema route handler builder.
schemaRoute(app, someSchema, (req, res) => {
	res.json(someSchema.response.parse(req.body));
});
```
