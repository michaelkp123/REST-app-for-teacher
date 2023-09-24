import { useLoaderData, useCatch } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import connectDb from "~/db/connectDb.server.js";

// Loader function to fetch the lesson data from the database
export async function loader({ params }) {
  const db = connectDb();

  // Find the lesson item by its ID
  const lesson = await db.models.Lesson.findById(params.lessonItemId);

  // Return the lesson data as JSON response
  return json({ lesson });
}

// LessonPage component to display the lesson details
export default function LessonPage() {
  function formatDate(date) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(date).toLocaleDateString("en-GB", options);
  }

  // Access the lesson data from the loader using useLoaderData hook
  const { lesson } = useLoaderData();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">{lesson.title}</h1>
      <dl className="my-3 space-y-3">
        <div className="flex">
          <dt className="w-1/6 font-semibold">Date:</dt>
          <dd className="w-1/4">{formatDate(lesson.date)}</dd>
        </div>
        <div className="flex">
          <dt className="w-1/6 font-semibold">Time:</dt>
          <dd className="w-1/4">{lesson.time}</dd>
        </div>
        <div className="flex">
          <dt className="w-1/6 font-semibold">Title:</dt>
          <dd className="w-1/4">{lesson.title}</dd>
        </div>
        <div className="flex">
          <dt className="w-1/6 font-semibold">Content:</dt>
          <dd className="w-1/4">{lesson.content}</dd>
        </div>
      </dl>
      <form method="post">
        <button
        type="submit"
        className="px-4 py-2 mr-2 text-red-500 border border-red-500 rounded">
          Slet
        </button>
      </form>
    </div>
  );
}

// CatchBoundary component to handle caught errors
export function CatchBoundary() {
  // Access the caught error using useCatch hook
  const caught = useCatch();
  return (
    <div>
      <h1>
        {caught.status} {caught.statusText}
      </h1>
      <h2>{caught.data}</h2>
    </div>
  );
}

// ErrorBoundary component to handle uncaught errors
export function ErrorBoundary({ error }) {
  return (
    <h1 className="font-bold text-red-500">
      {error.name}: {error.message}
    </h1>
  );
}

// Action function to handle the deletion of a lesson
export async function action({ params }) {
  const db = connectDb();

// Find and delete the lesson item by its ID
  await db.models.Lesson.findByIdAndDelete(params.lessonItemId);
  
// Redirect to the courses page after deletion
  return redirect("/courses");
}