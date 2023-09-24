import { redirect } from "@remix-run/node";
import { destroySession, requireTeacherSession } from "~/sessions.server";

export async function loader() {
  // Redirect to the "/courses" page
  return redirect("/courses");
}

export async function action({ request }) {
  // Require a teacher session
  const session = await requireTeacherSession(request);

  // Redirect to the "/login" page and destroy the session
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
