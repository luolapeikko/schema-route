import {type StandardBodyOutInfer, type StandardParamsOutInfer, type StandardQueryOutInfer, validateRequestHandler} from '@luolapeikko/express-standard-schema';
import type {StandardSchemaV1} from '@standard-schema/spec';
import type express from 'express';
import type {RequestHandler} from 'express';
import type {SchemaRoute, StandardMiddlewareObject, StandardOutputInfer} from '../../src/index.js';

export function hookRouter<T extends StandardMiddlewareObject, Out extends StandardSchemaV1<any, any> | undefined, R extends string>(
	app: express.Application,
	schema: SchemaRoute<T, Out, R>,
	handler: RequestHandler<StandardParamsOutInfer<T>, StandardOutputInfer<Out>, StandardBodyOutInfer<T>, StandardQueryOutInfer<T>>,
): void {
	const method = schema.method ?? 'GET';
	switch (method) {
		case 'GET':
			app.get(schema.router, validateRequestHandler(schema, handler));
			break;
		case 'POST':
			app.post(schema.router, validateRequestHandler(schema, handler));
			break;
		case 'PUT':
			app.put(schema.router, validateRequestHandler(schema, handler));
			break;
		case 'DELETE':
			app.delete(schema.router, validateRequestHandler(schema, handler));
			break;
		case 'PATCH':
			app.patch(schema.router, validateRequestHandler(schema, handler));
			break;
		default:
			throw new Error(`Unsupported method: ${method}`);
	}
}
