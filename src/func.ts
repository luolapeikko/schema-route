import type {StandardSchemaV1} from '@standard-schema/spec';
import type {BuildPathType, RequireAllParams, SchemaRoute, StandardInputInfer, StandardMiddlewareObject, StandardParamsInfer} from './types.js';

export function createSchemaRoute<
	T extends StandardMiddlewareObject,
	Out extends StandardSchemaV1<any, any> | undefined,
	R extends RequireAllParams<StandardParamsInfer<T>>,
>(reqHandler: T, router: R, buildPath: BuildPathType<T, R>, response: Out, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'): SchemaRoute<T, Out, R> {
	return {
		...reqHandler,
		buildPath,
		router,
		response,
		method,
	};
}

/**
 * Helper function to help resolve TS issue to handle optional parameters in path generation.
 * @param callback The {@link SchemaRoute.buildPath} function that generates the path string based on the parameters.
 * @param params The input parameters to pass to the callback function.
 * @returns The resolved path string.
 */
export function resolvePath<T extends StandardMiddlewareObject>(callback: (params: StandardParamsInfer<T>) => string, params?: StandardParamsInfer<T>): string {
	return callback(params ?? ({} as StandardParamsInfer<T>));
}

export function createURLSearchParams<T extends StandardMiddlewareObject>(query?: StandardInputInfer<T['query']>): URLSearchParams | undefined {
	if (!query) {
		return undefined;
	}
	return Object.entries(query).reduce((acc, [key, value]) => {
		acc.append(key, `${value}`);
		return acc;
	}, new URLSearchParams());
}
