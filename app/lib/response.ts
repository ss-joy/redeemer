import { GraphqlQueryError } from "@shopify/shopify-api";

type ErrorData = {
  data: any;
  message: string;
};

export function handleErrors(error: unknown) {
  let errorObject: ErrorData = {
    data: null,
    message: "",
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
