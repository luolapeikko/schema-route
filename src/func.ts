import type {StandardSchemaV1} from '@standard-schema/spec';
import type {BuildPathType} from './pathTypes.js';
import type {RequireAllParams, SchemaRoute, StandardMiddlewareObject, StandardParamsInfer} from './types.js';

export function createSchemaRoute<
	T extends StandardMiddlewareObject,
	Out extends StandardSchemaV1<any, any> | undefined,
	R extends RequireAllParams<StandardParamsInfer<T>>,
>(reqHandler: T, router: R, buildPath: BuildPathType<T, R>, response: Out, method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'): SchemaRoute<T, Out, R> {
	return {
		...reqHandler,
		buildPath,
		router,
		response,
		method: method ?? 'GET',
	};
}
