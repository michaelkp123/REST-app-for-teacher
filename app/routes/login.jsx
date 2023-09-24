import { json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import connectDb from "~/db/connectDb.server";
import { getSession, commitSession } from "~/sessions.server.js";

export async function loader({ request }) {
  // Get the session using the session cookie from the request headers
  const session = await getSession(request.headers.get("Cookie"));

  // Return the session data as JSON to the client as loader data
  return json({ teacherId: session.get("teacherId") });
}

export default function Login() {
  const actionData = useActionData();
  const { teacherId } = useLoaderData();

  return (
    <div className="max-w-md mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      {actionData?.errorMessage && (
        <p className="mb-4 rounded border border-red-500 bg-red-50 p-2 text-red-900">
          {actionData?.errorMessage}
        </p>
      )}
      {teacherId ? (
        <div>
          <p>
            Du er allerede logget ind som:
            <code className="ml-2 inline-block rounded bg-black p-2 text-white">
              {teacherId}
            </code>
          </p>
          <Form method="post" action="/logout">
            <Button>Logout</Button>
          </Form>
        </div>
      ) : (
        <Form method="post" reloadDocument>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            defaultValue={actionData?.values?.email}
          />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            defaultValue={actionData?.values?.password}
          />
          <div className="mt-4">
            <Button>Login</Button>
          </div>
          <p className="mt-3">
            Opret som lærer?{" "}
            <Link to="/signup" className="text-blue-500">
              Sign up
            </Link>
          </p>
          <p className="mt-3">
            Forsæt uden login?{" "}
            <Link to="/courses" className="text-blue-500">
              Klik her
            </Link>
          </p>
        </Form>
      )}
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData);
  const session = await getSession(request.headers.get("Cookie"));
  const db = connectDb();

  // Find the teacher in the database using the provided email
  const teacher = await db.models.Teacher.findOne({
    email: formData.get("email").trim(),
  });

  if (!teacher) {
    return json(
      // Return an error message and the form values to pre-fill the form
      { errorMessage: "Teacher not found", values: formDataObject },
      { status: 404 }
    );
  }

  // Compare the provided password with the stored password hash
  const passwordIsValid = await bcrypt.compare(
    formData.get("password").trim(),
    teacher.password
  );

  if (!passwordIsValid) {
    return json(
      // Return an error message and the form values to pre-fill the form
      { errorMessage: "Invalid password", values: formDataObject },
      { status: 401 }
    );
  }

  // If the teacher is found and the password is valid, set the teacherId in the session
  session.set("teacherId", teacher._id);

  // Redirect to the "/courses" page and update the session cookie along the way
  return redirect("/courses", {
    headers: {
      // Since we set a value in the session, we need to store it in the session cookie
      "Set-Cookie": await commitSession(session),
    },
  });
}

// Components --------------------------------------------------------
function Button({ children }) {
  return (
    <button
      type="submit"
      className="w-full py-3 px-4 rounded bg-blue-600 text-white transition-colors hover:bg-blue-700"
    >
      {children}
    </button>
  );
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block font-semibold">
      {children}
    </label>
  );
}

function Input({ name, id = name, type = "text", ...rest }) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      className="w-full mb-2 py-3 px-4 rounded border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      {...rest}
    />
  );
}