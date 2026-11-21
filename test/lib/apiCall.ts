import type {StandardSchemaV1} from '@standard-schema/spec';
import type {InferStandard, SchemaRoute, StandardMiddlewareObject, StandardOutputInfer, StandardParamsInfer} from '../../src/index.js';

export async function callSchema<T extends StandardMiddlewareObject, Out extends StandardSchemaV1<any, any> | undefined, R extends string>(
	schema: SchemaRoute<T, Out, R>,
	input: InferStandard<T>,
): Promise<StandardOutputInfer<Out>> {
	const method = schema.method ?? 'GET';
	const hasBody = 'body' in input;
	const query = input.query
		? Object.entries(input.query).reduce((acc, [key, value]) => {
				acc.append(key, `${value}`);
				return acc;
			}, new URLSearchParams())
		: undefined;
	const queryString = query ? `?${query.toString()}` : '';
	const res = await fetch(`http://localhost:${process.env.HTTP_PORT}${schema.buildPath(input.params as StandardParamsInfer<T>)}${queryString}`, {
		method,
		headers: hasBody ? {'content-type': 'application/json'} : undefined,
		body: hasBody ? JSON.stringify(input.body) : undefined,
	});

	if (!res.ok) {
		throw new Error(`Request failed with status ${res.status}`);
	}
	return (await res.json()) as StandardOutputInfer<Out>;
}
