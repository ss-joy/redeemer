import type { ActionFunctionArgs } from "@remix-run/node";

export type RemixRequest = ActionFunctionArgs["request"];

export type ErrorData = {
  data: any;
  message: string;
};

export type TReturnSuccessResponseWithCors = {
  request: RemixRequest;
  origin?: string;
  data?: unknown;
  message?: string;
  status?: number;
};

export type TReturnErrorResponseWithCors = {
  request: RemixRequest;
  origin?: string;
  error: unknown;
  message?: string;
  status?: number;
};
