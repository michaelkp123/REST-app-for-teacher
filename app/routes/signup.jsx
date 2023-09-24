import { json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { Form, useActionData, Link } from "@remix-run/react";
import connectDb from "~/db/connectDb.server";

export default function Signup() {
  const actionData = useActionData();
  return (
    <div className="max-w-md mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Sign Up</h1>
      {actionData?.errorMessage && (
        <p className="mb-4 rounded border border-red-500 bg-red-50 p-2 text-red-900">
          {actionData?.errorMessage}
        </p>
      )}
      <Form method="post" action="/signup">
        <Label htmlFor="username">Navn</Label>
        <Input
          type="text"
          name="Navn"
          id="Navn"
          placeholder="Navn"
          defaultValue={actionData?.values?.Navn}
        />
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          defaultValue={actionData?.values?.password}
        />
        <Label htmlFor="password">Email</Label>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="email"
          defaultValue={actionData?.values?.email}
        />
        <div className="mt-4">
          <Button>Sign Up</Button>
        </div>
        <p className="mt-3">
          Har du allerede et login?{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData);
  const db = connectDb();

    // Check if the username already exists
  const existingUser = await db.models.Teacher.findOne({
    teacherName: formData.get("Navn").trim(),
  });
  if (existingUser) {
    return json(
      // Return error message and form values to pre-populate the form
      { errorMessage: "Username already exists", values: formDataObject },
      { status: 409 }
    );
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(formData.get("password").trim(), 10);
  const newTeacher = new db.models.Teacher({
    teacherName: formData.get("Navn").trim(),
    password: hashedPassword,
    email: formData.get("email").trim(),
  });

   // Create a new Teacher object with the form data
  await newTeacher.save();

  // Redirect to the login selection page after successful signup
  return redirect("/login");
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
      className="w-full mb-4 py-3 px-4 rounded border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      {...rest}
    />
  );
}

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
