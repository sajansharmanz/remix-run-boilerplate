import { render } from "@testing-library/react";
import { Theme, ThemeProvider } from "remix-themes";
import { describe, expect, it } from "vitest";

import ThemeToggle from "~/components/ThemeToggle";

describe("ThemeToggle", () => {
  it("should render correctly", () => {
    const { container } = render(<ThemeToggle />, {
      wrapper: ({ children }) => (
        <ThemeProvider specifiedTheme={Theme.LIGHT} themeAction="/dummy">
          {children}
        </ThemeProvider>
      ),
    });

    expect(container).toHaveTextContent("Toggle theme");
  });
});
