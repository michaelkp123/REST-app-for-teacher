import { Form, useActionData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import connectDb from "~/db/connectDb.server.js";
import { requireTeacherSession } from "~/sessions.server";

// Loader function to require a teacher session before rendering the page
export async function loader({ request }) {
  // We require a user session here to prevent users from even seeing the course creation page without being logged in.
  await requireTeacherSession(request);
  return null;
}

// Action function to handle the creation of a new course
export async function action({ request }) {
  // We require a teacher session here to ensure that only logged-in teachers can create a course.
  const session = await requireTeacherSession(request);
  const form = await request.formData();
  const db = connectDb();

  try {
    const newCourse = new db.models.Course({
      title: form.get("title"),
      education: form.get("education"),
      startDate: new Date(form.get("startDate")),
      endDate: new Date(form.get("endDate")),
      ects: Number(form.get("ects")),
      semester: form.get("semester"),
      description: form.get("description"),
      responsibleTeacher: session.get("teacherId")
    });
    await newCourse.save();
    return redirect(`/courses/${newCourse._id}`);
  } catch (error) {
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
      { status: 400 }
    );
  }
}

// CreateCourse component to render the course creation form
export default function CreateCourse() {
  const actionData = useActionData();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Opret nyt fag</h1>
      <Form method="post">
        <label htmlFor="title" className="mb-1 block font-semibold">
          Fagets navn:
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Fagets navn"
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
        <label htmlFor="education" className="mb-1 block font-semibold">
          Uddannelse:
        </label>
        <input
          type="text"
          name="education"
          id="education"
          placeholder="Uddannelse"
          defaultValue={actionData?.values.education}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.education ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.education && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.education.message}
          </p>
        )}
        <label htmlFor="startDate" className="mb-1 block font-semibold">
          Start dato:
        </label>
        <input
          type="date"
          name="startDate"
          id="startDate"
          defaultValue={actionData?.values.startDate}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.startDate ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.startDate && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.startDate.message}
          </p>
        )}
        <label htmlFor="endDate" className="mb-1 block font-semibold">
          Slut dato:
        </label>
        <input
          type="date"
          name="endDate"
          id="endDate"
          defaultValue={actionData?.values.endDate}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.endDate ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.endDate && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.endDate.message}
          </p>
        )}
        <label htmlFor="ects" className="mb-1 block font-semibold">
          ECTS point:
        </label>
        <input
          type="number"
          name="ects"
          id="ects"
          placeholder="ECTS"
          defaultValue={actionData?.values.ects}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.ects ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.ects && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.ects.message}
          </p>
        )}
        <label htmlFor="semester" className="mb-1 block font-semibold">
         Hvilket semester:
        </label>
        <input
          type="text"
          name="semester"
          id="semester"
          placeholder="Hvilket semester"
          defaultValue={actionData?.values.semester}
          className={[
            "rounded border border-blue-600  p-2",
            actionData?.errors.semester ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.semester && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.semester.message}
          </p>
        )}
        <label htmlFor="description" className="mb-1 block font-semibold">
          Overordnet beskrivelse:
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Beskrivelse"
          defaultValue={actionData?.values.description}
          className={[
            "rounded border border-blue-600  p-2 w-1/2 h-40",
            actionData?.errors.description ? "border-2 border-red-500" : "",
          ].join(" ")}
        ></textarea>
        {actionData?.errors.description && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.description.message}
          </p>
        )}
        <br />
        <button
          type="submit"
          className="py-3 px-4 rounded bg-blue-600 text-white transition-colors hover:bg-blue-700"
        >
          Save
        </button>
      </Form>
    </div>
  );
}