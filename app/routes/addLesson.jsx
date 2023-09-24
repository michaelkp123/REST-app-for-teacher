import { json, redirect } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import Modal from "~/components/Modal";
import connectDb from "~/db/connectDb.server.js";
import { requireTeacherSession } from "~/sessions.server";

// Loader function to require teacher session
export async function loader({ request }) {
  await requireTeacherSession(request);
  return null;
}
  
// CreateLesson component
export default function CreateLesson() {
  const actionData = useActionData();
  

  return (
    <Modal link="/courses">
      <Form method="post">
      <input type="hidden" name="courseId" value={new URLSearchParams(window.location.search).get("courseId")} />
        <label htmlFor="date" className="mb-1 block font-semibold">
         Dato:
        </label>
        <input
          type="date"
          name="date"
          id="date"
          defaultValue={actionData?.values.date}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.date ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.date && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.date.message}
          </p>
        )}
        <label htmlFor="time" className="mb-1 block font-semibold">
          Tidspunkt:
        </label>
        <input
          type="time"
          name="time"
          id="time"
          placeholder="Tidspunkt"
          defaultValue={actionData?.values.time}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.time ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.time && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.time.message}
          </p>
        )}
        <label htmlFor="title" className="mb-1 block font-semibold">
         Overskrift/ tema for lektionen:
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Overskrift/ tema for lektionen"
          defaultValue={actionData?.values.title}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.title ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.title && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.title.message}
          </p>
        )}
        <label htmlFor="description" className="mb-1 block font-semibold">
          Indhold for lektionen:
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Indhold for lektionen"
          defaultValue={actionData?.values.description}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.description ? "border-2 border-red-500" : "",
          ].join(" ")}
        ></textarea>
        {actionData?.errors.description && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.description.message}
          </p>
        )}
        <br />
        <button type="submit" className="py-3 px-4 rounded bg-blue-600 text-white transition-colors hover:bg-blue-700">Save</button>
      </Form>
    </Modal>
  );
}

// Action function to handle form submission
export async function action({ request }) {
  const session = await requireTeacherSession(request);
  const form = await request.formData();
  const db = connectDb();


  try {
// Create a new lesson using the form data
    const newLesson = new db.models.Lesson({
      courseId: form.get("courseId"),
      date: new Date(form.get("date")),
      time: form.get("time"),
      responsibleTeacher: session.get("teacherId"),
      title: form.get("title"),
      content: form.get("description"),
    });
    await newLesson.save();
// Redirect to the courses page
    return redirect("/courses");
  } catch (error) {
// Handle errors if any validation errors occur
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
      { status: 400 }
    );
  }
}