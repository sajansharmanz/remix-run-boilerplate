import { render } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import NavbarBrand from "~/components/NavbarBrand";
import { useEnvironmentVariables } from "~/components/Providers/EnvironmentVariables";

vi.mock("~/components/Providers/EnvironmentVariables");

describe("Navbar Brand", () => {
  beforeAll(() => {
    vi.mocked(useEnvironmentVariables).mockReturnValue({
      APP_NAME: "My App Name",
    });
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should render correctly", () => {
    const { container, getByRole } = render(<NavbarBrand />);

    expect(container).toHaveTextContent("My App Name");
    expect(getByRole("img")).toHaveAttribute("src", "/icons/image.png");
    expect(getByRole("img")).toHaveAttribute("alt", "");
  });

  it("should render added classes correctly", () => {
    const { getByTestId } = render(<NavbarBrand className="test-class" />);

    expect(getByTestId("brand-wrapper")).toHaveClass("test-class");
  });
});
