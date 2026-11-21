import type { StandardParamsInfer } from "./pathTypes.js";
import type { RequireAllParams, StandardMiddlewareObject } from "./types.js";

/**
 * Represents the type of a router path, combining required parameters inferred from the middleware object with additional route string parameters.
 * @template T - The type of the standard middleware object.
 * @template R - The type of the additional route string parameters.
 * @returns The combined router path type like `/path/:param` where `:param` is inferred from the middleware object's parameters.
 */
export type RouterPathType<T extends StandardMiddlewareObject, R extends string> = RequireAllParams<StandardParamsInfer<T>> & R;