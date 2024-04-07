import { render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NonceProvider, { useNonce } from "~/components/Providers/Nonce";

describe("Nonce Provider", () => {
  it("shoulld render children correctly", () => {
    const { container } = render(
      <NonceProvider nonce="test-nonce">
        <p>Children go here</p>
      </NonceProvider>,
    );

    expect(container).toHaveTextContent("Children go here");
  });

  it("should ingest nonce value correctly", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return <NonceProvider nonce="test-nonce">{children}</NonceProvider>;
    };

    const { result } = renderHook(() => useNonce(), {
      wrapper,
    });

    expect(result.current).toBe("test-nonce");
  });
});
