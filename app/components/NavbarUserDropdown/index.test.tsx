import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import UserDropdown from "~/components/NavbarUserDropdown";
import { useUser } from "~/components/Providers/User";

vi.mock("~/components/Providers/User");

describe("User Dropdown", () => {
  it("should render correctly when logged out", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, avatar: null });

    const { container } = render(<UserDropdown />);

    fireEvent.click(container);

    waitFor(() => {
      expect(screen.getByRole("img")).toHaveAttribute("src", "/icons/user.png");
      expect(screen).toHaveTextContent("My Account");
      expect(screen).toHaveTextContent("Login");
    });
  });

  it("should render correctly when logged in", () => {
    vi.mocked(useUser).mockReturnValue({
      user: {
        id: "idvalue",
        email: "test@example.com",
        otpEnabled: false,
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "ENABLED",
      },
      avatar: "myavatar",
    });

    const { container } = render(<UserDropdown />);

    fireEvent.click(container);

    waitFor(() => {
      expect(screen.getByRole("img")).toHaveAttribute("src", "myavatar");
      expect(screen).toHaveTextContent("My Account");
      expect(screen).toHaveTextContent("Account");
      expect(screen).toHaveTextContent("Profile");
      expect(screen).toHaveTextContent("Security");
      expect(screen).toHaveTextContent("Logout");
    });
  });
});
