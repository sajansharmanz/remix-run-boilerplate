import { render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import UserProvider, { useUser } from "~/components/Providers/User";

import { UserResponseBody } from "~/types/user.types";

describe("User Provider", () => {
  it("should render children correctly", () => {
    const { container } = render(
      <UserProvider user={null} avatar={null}>
        <p>Children go here</p>
      </UserProvider>,
    );

    expect(container).toHaveTextContent("Children go here");
  });

  it("should ingest the user correctly if null", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider user={null} avatar={null}>
        {children}
      </UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBe(null);
  });

  it("should ingest the user correctly if user it OTP enabled waiting for verification", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider
        avatar={null}
        user={{ id: "random string", otpEnabled: true } as UserResponseBody}
      >
        {children}
      </UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBe(null);
  });

  it("should ingest the user correctly if valid", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider
        avatar={null}
        user={
          {
            id: "random string",
            email: "randomemail",
            otpEnabled: true,
          } as UserResponseBody
        }
      >
        {children}
      </UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).not.toBe(null);
  });

  it("should ingest the avatar correctly if null", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider user={null} avatar={null}>
        {children}
      </UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.avatar).toBe(null);
  });

  it("should ingest the avatar correctly if valid", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider user={null} avatar={"myavatarurl"}>
        {children}
      </UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.avatar).toBe("myavatarurl");
  });
});
