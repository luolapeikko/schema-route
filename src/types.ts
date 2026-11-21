import type {StandardSchemaV1} from '@standard-schema/spec';

export type StandardInputInfer<T> = T extends StandardSchemaV1<infer U, infer _> ? U : never;
export type StandardOutputInfer<T> = T extends StandardSchemaV1<infer _, infer V> ? V : never;

/** Standard schema body type for request payloads */
export type StandardSchemaBodyType<T = unknown> = StandardSchemaV1<unknown, T>;
// copy of express's ParamsDictionary type
interface ParamsDictionary {
	[key: string | number]: string;
}
/** Standard schema params type for route parameters */
export type StandardSchemaParamsType<T = unknown> = StandardSchemaV1<ParamsDictionary, T>;
// copy of express's ParsedQs type
type ParsedQs = {[key: string]: undefined | string | string[] | ParsedQs | ParsedQs[]};
/** Standard schema query type for query parameters */
export type StandardSchemaQueryType<T = unknown> = StandardSchemaV1<ParsedQs, T>;

/**
 * Represents the standard middleware object containing optional body, params, and query schemas.
 */
export type StandardMiddlewareObject = Readonly<{
	body?: StandardSchemaBodyType;
	params?: StandardSchemaParamsType;
	query?: StandardSchemaQueryType;
}>;

export type StandardParamsInfer<Z extends StandardMiddlewareObject> = Z['params'] extends StandardSchemaParamsType ? StandardInputInfer<Z['params']> : {};

/**
 * Recursively requires all route parameters in a string.
 */
export type RequireAllParams<T, Keys extends string = keyof T & string> = [Keys] extends [never]
	? string
	: string extends Keys
		? string
		: {
				[K in Keys]: `${string}:${K}${string}` & RequireAllParams<T, Exclude<Keys, K>>;
			}[Keys];

type HaveParams<T extends StandardMiddlewareObject> = T['params'] extends StandardSchemaParamsType
	? {params: StandardInputInfer<T['params']>}
	: {params?: never};
type HaveBody<T extends StandardMiddlewareObject> = T['body'] extends StandardSchemaBodyType ? {body: StandardInputInfer<T['body']>} : {body?: never};
type HaveQuery<T extends StandardMiddlewareObject> = T['query'] extends StandardSchemaQueryType ? {query: StandardInputInfer<T['query']>} : {query?: never};
/**
 * Extracts the inferred parameters, body, and query types from the standard middleware object.
 */
export type InferStandard<S extends StandardMiddlewareObject> = HaveParams<S> & HaveBody<S> & HaveQuery<S>;
/**
 * Extracts the inferred body type from the standard middleware object.
 */
export type InferBody<T extends StandardMiddlewareObject> = T['body'] extends StandardSchemaBodyType ? StandardInputInfer<T['body']> : never;
/**
 * Extracts the inferred query type from the standard middleware object.
 */
export type InferQuery<T extends StandardMiddlewareObject> = T['query'] extends StandardSchemaQueryType ? StandardInputInfer<T['query']> : never;
/**
 * Extracts the inferred parameters type from the standard middleware object.
 */
export type InferParams<T extends StandardMiddlewareObject> = T['params'] extends StandardSchemaParamsType ? StandardInputInfer<T['params']> : never;

/**
 * Take router template string and replace route params with actual values from the parameters, `/api/:id` becomes as `/api/${string}`.
 */
export type ReplaceRouteParams<S extends string> = S extends `${infer Start}:${string}/${infer Rest}`
	? `${Start}${string}/${ReplaceRouteParams<Rest>}`
	: S extends `${infer Start}:${string}`
		? `${Start}${string}`
		: S;

export type BuildPathType<T extends StandardMiddlewareObject, R extends string> = (params: StandardParamsInfer<T>) => ReplaceRouteParams<R>;

/**
 * Represents the type of a router path, combining required parameters inferred from the middleware object with additional route string parameters.
 * @template T - The type of the standard middleware object.
 * @template R - The type of the additional route string parameters.
 * @returns The combined router path type like `/path/:param` where `:param` is inferred from the middleware object's parameters.
 */
export type RouterPathType<T extends StandardMiddlewareObject, R extends string> = RequireAllParams<InferParams<T>> & R;

export type SchemaRoute<T extends StandardMiddlewareObject, Out extends StandardSchemaV1<any, any> | undefined, R extends string> = T & {
	/**
	 * The router full path with parameters defined as :param(s).
	 * @example '/api/:id/role'
	 *
	 */
	router: RouterPathType<T, R>;
	/**
	 * Builds the full path for the client handler based on query parameters
	 * @example (params) => `/api/${params.id}/role`
	 */
	buildPath: BuildPathType<T, R>;
	/**
	 * The HTTP method for the route, such as 'GET', 'POST', 'PUT', 'DELETE', or 'PATCH'.
	 */
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	/**
	 * The response schema for the route, defining the expected structure of the response payload.
	 */
	response: Out;
};
