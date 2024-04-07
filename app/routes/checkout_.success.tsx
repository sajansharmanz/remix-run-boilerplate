import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import csrfCookie from "~/cookies/csrf.cookie.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);

  return json({ sessionId, csrf }, { headers });
};

export default function CheckoutSucccess() {
  const { sessionId, csrf } = useLoaderData<typeof loader>();

  if (sessionId) {
    return (
      <div>
        <h1>Subscription success!</h1>
        <Form method="post" action="/portal/create">
          <input type="hidden" name="csrf" value={csrf} />
          <input type="hidden" name="session_id" value={sessionId} />
          <button type="submit">Manage your billing information</button>
        </Form>
      </div>
    );
  }

  return <h1>Checkout success!</h1>;
}
