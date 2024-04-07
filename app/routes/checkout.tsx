import { Form, json, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import csrfCookie from "~/cookies/csrf.cookie.server";

export const loader = async () => {
  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);

  return json({ csrf }, { headers });
};

export default function Checkout() {
  const { csrf } = useLoaderData<typeof loader>();

  return (
    <main>
      <div>
        <h1>Single Payment</h1>
        <Form method="post" action="create">
          <Input type="hidden" name="csrf" value={csrf} />
          <Button type="submit">Checkout</Button>
        </Form>
      </div>

      <div>
        <h1>Subscription Payment</h1>
        <Form method="post" action="create">
          <Input type="hidden" name="csrf" value={csrf} />
          <Input type="hidden" name="lookup_key" value="standard_monthly" />
          <Button type="submit">Checkout</Button>
        </Form>
      </div>
    </main>
  );
}
