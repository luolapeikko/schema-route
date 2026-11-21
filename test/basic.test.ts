import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {z} from 'zod';
import {createSchemaRoute, type InferStandard, type SchemaRoute, type StandardOutputInfer} from '../src/index.js';

const basicSchema = createSchemaRoute({body: z.object({name: z.string()})}, '/api/basic', (_params) => `/api/basic`, z.object({name: z.string()}));

function callSchema<T extends SchemaRoute<any, any, any>>(schema: T, input: InferStandard<T>): Promise<StandardOutputInfer<T['response']>> {
    const res = fetch(schema.buildPath(input));
    return res.then(r => r.json()) as Promise<StandardOutputInfer<T['response']>>;
}

describe('Basic tests', () => {
	beforeAll(() => {
		// Setup temporary expressjs and add router from basicSchema.router
	});
	it('should work', async () => {
        const data = await callSchema(basicSchema, {body: {name: 'test'}});
		expect(basicSchema.response.safeParse(data)).toBe(true);
	});
});
