import type {Server} from 'node:http';
import express from 'express';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {z} from 'zod';
import {createSchemaRoute} from '../src/index.js';
import {callSchema} from './lib/apiCall.js';
import {hookRouter} from './lib/express.js';

const routeSchema = createSchemaRoute({body: z.object({name: z.string()})}, '/api/basic', (_params) => `/api/basic`, z.object({name: z.string()}), 'POST');

const app = express();
let server: Server;

describe('Body tests', () => {
	beforeAll(async () => {
		app.use(express.json());
		hookRouter(app, routeSchema, (req, res) => {
			res.json(routeSchema.response.parse(req.body));
		});
		await new Promise<void>((resolve) => {
			server = app.listen(`${process.env.HTTP_PORT}`, () => resolve());
		});
	});
	afterAll(async () => {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
	});
	it('should work', async () => {
		const data = await callSchema(routeSchema, {body: {name: 'test'}});
		expect(routeSchema.response.safeParse(data).success).toBe(true);
	});
});
