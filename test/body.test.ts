import type {Server} from 'node:http';
import express from 'express';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {z} from 'zod';
import {createSchemaRoute} from '../src/index.js';
import {schemaApiCall} from './lib/apiCall.js';
import {schemaRoute} from './lib/express.js';

const routeSchema = createSchemaRoute({body: z.object({name: z.string()})}, '/api/basic', (_) => `/api/basic`, z.object({name: z.string()}), 'POST');

const app = express();
let server: Server;

describe('Body tests', () => {
	beforeAll(async () => {
		app.use(express.json());
		schemaRoute(app, routeSchema, (req, res) => {
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
		await expect(schemaApiCall(routeSchema, {body: {name: 'test'}})).resolves.toEqual({name: 'test'});
	});
});
