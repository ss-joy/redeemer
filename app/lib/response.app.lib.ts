import type {
  TReturnErrorResponseWithCors,
  TReturnSuccessResponseWithCors,
  ErrorData,
} from "../types/remix-http.types";

import { GraphqlQueryError } from "@shopify/shopify-api";
import { cors } from "remix-utils/cors";

export function handleErrors(error: unknown, message: string): ErrorData {
  let errorObject: ErrorData = {
    data: null,
    message: message,
  };

  if (error instanceof GraphqlQueryError) {
    console.log(error.body);
    errorObject.data = error.body;
    errorObject.message = error.message;
  } else if (error instanceof Error) {
    errorObject.data = error.cause;
    errorObject.message = error.message;
  }

  return errorObject;
}

export async function SuccessResponseWithCors({
  data = {},
  message = "success",
  origin = "*",
  request,
}: TReturnSuccessResponseWithCors): Promise<Response> {
  return await cors(
    request,
    new Response(
      JSON.stringify({
        message: message,
        data: data,
      }),
    ),
    {
      origin: origin,
    },
  );
}

export async function ErrorResponseWithCors({
  error,
  message = "Something went wrong",
  origin = "*",
  request,
}: TReturnErrorResponseWithCors): Promise<Response> {
  return await cors(
    request,
    new Response(JSON.stringify(handleErrors(error, message))),
    {
      origin: origin,
    },
  );
}
