import { json } from "@remix-run/node";
import {
  Links,
  Link,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Form,
} from "@remix-run/react";
import styles from "~/tailwind.css";
import { getSession } from "./sessions.server";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return {
    charset: "utf-8",
    title: "Teacher Portal",
    viewport: "width=device-width,initial-scale=1",
  };
}

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return json({
    isAuthenticated: session.has("teacherId"),
  });
}

export default function App() {
  const { isAuthenticated } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 p-4 font-sans text-gray-900">
        <header className="mb-4 flex flex-row items-center border-b border-gray-200 pb-3">
          <Link to="/courses" className="text-blue-600 hover:underline">
            Hjem
          </Link>
          {isAuthenticated && (
            <Link
              to="/courses/new"
              className="ml-3 text-blue-600 hover:underline"
            >
              Nyt fag
            </Link>
          )}
          {isAuthenticated ? (
            <Form method="post" action="/logout" className="ml-auto inline">
              <button className="text-blue-600 hover:underline">
                Sign out
              </button>
            </Form>
          ) : (
            <Link
              to="/login"
              className="ml-auto text-blue-600 hover:underline"
            >
              Login
            </Link>
          )}
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}