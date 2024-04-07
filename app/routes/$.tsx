import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => [
  { title: "Page not found - My App" },
  { name: "description", content: "Page not found" },
];

export default function NotFound() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      <img
        src="/icons/broken-browser.png"
        alt="Icon of lost person looking at map"
        className="mb-2 h-32 w-auto"
      />
      <h3 className="text-2xl">
        We can&apos;t seem to find what you are looking for!
      </h3>
      <br />
      <Link to="/">
        <Button type="button">Click here to go home</Button>
      </Link>
    </main>
  );
}
