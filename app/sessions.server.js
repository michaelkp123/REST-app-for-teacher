import { createCookieSessionStorage } from "@remix-run/node";
import { sessionCookie } from "~/cookies.server.js";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };

export async function requireTeacherSession(request) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);


  return session;
}
