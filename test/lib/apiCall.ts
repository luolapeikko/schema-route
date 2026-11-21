import type {StandardSchemaV1} from '@standard-schema/spec';
import {
	createURLSearchParams,
	type InferStandard,
	resolvePath,
	type SchemaRoute,
	type StandardMiddlewareObject,
	type StandardOutputInfer,
} from '../../src/index.js';

export async function schemaApiCall<T extends StandardMiddlewareObject, Out extends StandardSchemaV1<any, any> | undefined, R extends string>(
	schema: SchemaRoute<T, Out, R>,
	input: InferStandard<T>,
): Promise<StandardOutputInfer<Out>> {
	const hasBody = 'body' in input;
	const queryParams = createURLSearchParams(input.query);
	const query = queryParams ? `?${queryParams.toString()}` : '';
	const res = await fetch(`http://localhost:${process.env.HTTP_PORT}${resolvePath(schema.buildPath, input.params)}${query}`, {
		method: schema.method,
		headers: hasBody ? {'content-type': 'application/json'} : undefined,
		body: hasBody ? JSON.stringify(input.body) : undefined,
	});
	if (!res.ok) {
		throw new Error(`Request failed with status ${res.status}`);
	}
	// only validate the response if a response schema is defined
	if (schema.response) {
		const schemaRes = await schema.response['~standard'].validate(await res.json());
		if (schemaRes.issues) {
			throw new Error(`Validation failed: ${JSON.stringify(schemaRes.issues)}`);
		}
		return schemaRes.value;
	}
	return undefined as StandardOutputInfer<Out>;
}
