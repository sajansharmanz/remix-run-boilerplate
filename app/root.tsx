import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import Navbar from "~/components/Navbar";
import EnvironmentVariablesProvider from "~/components/Providers/EnvironmentVariables";
import { useNonce } from "~/components/Providers/Nonce";
import UserProvider from "~/components/Providers/User";
import { Toaster } from "~/components/ui/toaster";

import env from "~/config/environment.config.server";

import { themeSessionCookie } from "~/cookies/theme.cookie.server";
import userCookie from "~/cookies/user.cookie.server";

import profileService from "~/service/profile.service.server";

import { UserResponseBody } from "~/types/user.types";

import rootStylesHref from "./root.css?url";

export const links: LinksFunction = () => [
  { rel: "preload", href: rootStylesHref, as: "style" },
  { rel: "stylesheet", href: rootStylesHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getTheme } = await themeSessionCookie(request);
  const user = await userCookie.getValue(request);
  const { APP_NAME, GOOGLE_OAUTH_CLIENT_ID, APPLE_OAUTH_CLIENT_ID } = env;

  let avatar: string | null = null;

  if (user && "email" in user) {
    avatar = await profileService.findAvatarByUserId(user.id);
  }

  return {
    theme: getTheme(),
    environmentVariables: {
      APP_NAME,
      GOOGLE_OAUTH_CLIENT_ID,
      APPLE_OAUTH_CLIENT_ID,
    },
    user,
    avatar,
  };
};

export const meta: MetaFunction = () => [
  { title: "My App" },
  { name: "description", content: "My website description" },
  { name: "keywords", content: "app, keywords" },
  { name: "author", content: "app, keywords" },
  { name: "image", content: "url" },
  { name: "og:url", content: "og:url" },
  { name: "og:title", content: "og:title" },
  { name: "og:description", content: "og:description" },
  { name: "og:image", content: "og:image" },
  { name: "og:type", content: "og:type" },
];

export function App() {
  const nonce = useNonce();
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <Outlet />
        <Toaster />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />

        <script
          type="text/javascript"
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        ></script>
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const nonce = useNonce();
  const { theme, environmentVariables, user, avatar } =
    useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={theme} themeAction="/action/set-theme">
      <EnvironmentVariablesProvider variables={environmentVariables}>
        <GoogleOAuthProvider
          clientId={environmentVariables.GOOGLE_OAUTH_CLIENT_ID}
          nonce={nonce}
        >
          <UserProvider user={user as UserResponseBody} avatar={avatar}>
            <App />
          </UserProvider>
        </GoogleOAuthProvider>
      </EnvironmentVariablesProvider>
    </ThemeProvider>
  );
}
