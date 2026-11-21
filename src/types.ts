import type {StandardSchemaV1} from '@standard-schema/spec';
import type {BuildPathType} from './pathTypes.js';
import type {RouterPathType} from './routerTypes.js';

export type StandardInputInfer<T> = T extends StandardSchemaV1<infer U, infer _> ? U : never;
export type StandardOutputInfer<T> = T extends StandardSchemaV1<infer _, infer V> ? V : never;

type StandardSchemaBodyType<T = unknown> = StandardSchemaV1<unknown, T>;
// copy of express's ParamsDictionary type
interface ParamsDictionary {
	[key: string | number]: string;
}
type StandardSchemaParamsType<T = unknown> = StandardSchemaV1<ParamsDictionary, T>;
// copy of express's ParsedQs type
type ParsedQs = {[key: string]: undefined | string | string[] | ParsedQs | ParsedQs[]};
type StandardSchemaQueryType<T = unknown> = StandardSchemaV1<ParsedQs, T>;

export type StandardMiddlewareObject = Readonly<{
	body?: StandardSchemaBodyType;
	params?: StandardSchemaParamsType;
	query?: StandardSchemaQueryType;
}>;

export type StandardParamsInfer<Z extends StandardMiddlewareObject> = Z['params'] extends StandardSchemaParamsType ? StandardInputInfer<Z['params']> : {};

export type RequireAllParams<T, Keys extends string = keyof T & string> = [Keys] extends [never]
	? string
	: string extends Keys
		? string
		: {
				[K in Keys]: `${string}:${K}${string}` & RequireAllParams<T, Exclude<Keys, K>>;
			}[Keys];

type SchemaInfer<T> = T extends StandardSchemaV1<infer _, infer U> ? U : never;
type HaveParams<T extends StandardMiddlewareObject> = T['params'] extends StandardSchemaV1 ? {params: SchemaInfer<T['params']>} : {params?: never};
type HaveBody<T extends StandardMiddlewareObject> = T['body'] extends StandardSchemaV1 ? {body: SchemaInfer<T['body']>} : {body?: never};
type HaveQuery<T extends StandardMiddlewareObject> = T['query'] extends StandardSchemaV1 ? {query: SchemaInfer<T['query']>} : {query?: never};
export type InferStandard<S extends StandardMiddlewareObject> = HaveParams<S> & HaveBody<S> & HaveQuery<S>;

export type InferBody<T extends StandardMiddlewareObject> = T['body'] extends StandardSchemaBodyType ? StandardInputInfer<T['body']> : never;

export type ClientHandleInfer<T extends SchemaRoute<StandardMiddlewareObject, StandardSchemaV1<unknown, T>, any>> =
	T extends SchemaRoute<infer S, any, any> ? S : never;

export type SchemaRoute<T extends StandardMiddlewareObject, Out extends StandardSchemaV1<any, any> | undefined, R extends string> = T & {
	/**
	 * The router path with parameters defined as :param(s).
	 * @example '/api/:id/role'
	 *
	 */
	router: RouterPathType<T, R>;
	/**
	 * Builds the path for the client handler based on query parameters
	 * @example (params) => `/api/${params.id}/role`
	 */
	buildPath: BuildPathType<T, R>;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	response?: Out;
};
