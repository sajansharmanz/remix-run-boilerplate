import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center bg-red-200 p-4 text-center">
        <img
          src="/icons/broken-browser.png"
          alt="Icon of lost person looking at map"
          className="mb-2 h-32 w-auto"
        />
        <h3 className="text-2xl">
          {error.status === 404
            ? "We're having some trouble finding that"
            : "Oops! Something went wrong!"}
        </h3>
      </div>
    );
  }

  return <h1>Unknown Error</h1>;
};

ErrorBoundary.displayName = "Component:ErrorBoundary";

export default ErrorBoundary;
