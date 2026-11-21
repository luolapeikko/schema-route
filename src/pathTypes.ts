import type {StandardSchemaV1} from '@standard-schema/spec';
import type {InferStandard, StandardInputInfer, StandardMiddlewareObject} from './types.js';

interface ParamsDictionary {
	[key: string | number]: string;
}
type StandardSchemaParamsType<T = unknown> = StandardSchemaV1<ParamsDictionary, T>;

export type StandardParamsInfer<Z extends StandardMiddlewareObject> = Z['params'] extends StandardSchemaParamsType ? StandardInputInfer<Z['params']> : {};

export type ReplaceParams<S extends string> = S extends `${infer Start}:${string}/${infer Rest}`
	? `${Start}${string}/${ReplaceParams<Rest>}`
	: S extends `${infer Start}:${string}`
		? `${Start}${string}`
		: S;

export type BuildPathType<T extends StandardMiddlewareObject, R extends string> = (params: StandardParamsInfer<T>) => ReplaceParams<R>
