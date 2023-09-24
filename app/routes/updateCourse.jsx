import { json, redirect } from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";
import Modal from "~/components/Modal";
import connectDb from "~/db/connectDb.server.js";
import { requireTeacherSession } from "~/sessions.server";

export async function loader({ request }) {
  // Require a teacher session to prevent unauthorized access to the course creation page.
  const session = await requireTeacherSession(request);
  const db = connectDb();
  const course = await db.models.Course.find({
    responsibleTeacher: session.get("teacherId"),
  });

  return json(course);
}

export default function CreateCourse() {
  const course = useLoaderData();
  const actionData = useActionData();

  return (
    <Modal link="/courses">
      <h1 className="mb-4 text-2xl font-bold">Update Your Course</h1>
              <Form method="post">
          <label htmlFor="title" className="mb-1 block font-semibold">
            Fagets navn:
          </label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Title"
            defaultValue={course[0].title ?? actionData?.values.title}
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
            placeholder="Education"
            defaultValue={course[0].education ?? actionData?.values.education}
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
            Start Dato:
          </label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            defaultValue={course[0].startDate ?? actionData?.values.startDate}
            className={[
              "rounded border border-blue-600 p-2",
              actionData?.errors.startDate ? "border-2 border-red-500" : "",
            ].join(" ")}
          />
          {actionData?.errors.startDate && (
            <p className="mb-0 mt-1 text-red-500">
              {actionData.errors.startDate.message}
            </p>
          )}
          <label htmlFor="endDate" className="mb-1 block font-semibold">
            Slut Dato:
          </label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            defaultValue={course[0].endDate ?? actionData?.values.endDate}
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
            defaultValue={course[0].ects ?? actionData?.values.ects}
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
           Hvilket Semester:
          </label>
          <input
            type="text"
            name="semester"
            id="semester"
            placeholder="Semester"
            defaultValue={course[0].semester ?? actionData?.values.semester}
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
            placeholder="Description"
            defaultValue={course[0].description ?? actionData?.values.description}
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
          <button
            type="submit"
            className="py-3 px-4 rounded bg-blue-600 text-white transition-colors hover:bg-blue-700"
          >
            Save
          </button>
        </Form>
    </Modal>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const db = connectDb();

  try {
    // Get the course ID from the URL query parameters
    const searchParams = new URLSearchParams(request.url.split("?")[1]);
    const courseId = searchParams.get("courseId");
    const course = await db.models.Course.findById(courseId);

    // Update the course details with the form data
    course.title = form.get("title");
    course.education = form.get("education");
    course.startDate = new Date(form.get("startDate"));
    course.endDate = new Date(form.get("endDate"));
    course.ects = Number(form.get("ects"));
    course.semester = form.get("semester");
    course.description = form.get("description");

    await course.save();
    return redirect(`/courses/${course._id}`);
  } catch (error) {
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
      { status: 400 }
    );
  }
}
