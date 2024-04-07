export interface IError {
  [x: string]: string[] | undefined;
  [x: number]: string[] | undefined;
  [x: symbol]: string[] | undefined;
}

export class AuthenticationError extends Error {
  currentRoute = "/";
  redirect = true;

  constructor({
    currentRoute,
    redirect,
  }: {
    currentRoute?: string;
    redirect?: boolean;
  }) {
    super("Authentication error");

    const noReturnUrls = ["/logout", "/logoutAll", "me/account/delete"];

    if (noReturnUrls.some((value) => value === currentRoute)) {
      this.currentRoute = "/";
    } else {
      this.currentRoute = currentRoute || "/";
    }

    this.redirect = redirect ?? false;
  }
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract statusText: string;
  abstract errors: IError;

  constructor(statusText: string) {
    super(statusText);
  }

  abstract serializeErrors(): IError;
}

export class ValidationError extends CustomError {
  statusCode = 400;
  statusText = "Validation Error(s)";
  errors: IError;

  constructor(errors: IError) {
    super("Validation Error(s)");
    this.errors = errors;
  }

  serializeErrors(): IError {
    return this.errors;
  }
}

export class ForbiddenError extends CustomError {
  statusCode = 403;
  statusText = "Forbidden Error";
  errors: IError = {
    ForbiddenError: ["Forbidden Error"],
  };

  constructor() {
    super("Forbidden Error");
  }

  serializeErrors() {
    return this.errors;
  }
}
