import { render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EnvironmentVariablesProvider, {
  useEnvironmentVariables,
} from "~/components/Providers/EnvironmentVariables";

describe("Environment Variables Provider", () => {
  it("should render children correctly", () => {
    const { container } = render(
      <EnvironmentVariablesProvider variables={{}}>
        <p>Children go here</p>
      </EnvironmentVariablesProvider>,
    );

    expect(container).toHaveTextContent("Children go here");
  });

  it("should ingest the variables correctly", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <EnvironmentVariablesProvider variables={{ APP_NAME: "My App Name" }}>
          {children}
        </EnvironmentVariablesProvider>
      );
    };

    const { result } = renderHook(() => useEnvironmentVariables(), {
      wrapper,
    });

    expect(result.current).toEqual({
      APP_NAME: "My App Name",
      GOOGLE_OAUTH_CLIENT_ID: undefined,
      APPLE_OAUTH_CLIENT_ID: undefined,
    });
  });
});
