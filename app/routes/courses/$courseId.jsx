import { useLoaderData, useCatch, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import connectDb from "~/db/connectDb.server.js";
import { getSession } from "~/sessions.server";
import { RiAddFill, RiArrowRightSLine, RiEdit2Fill, RiDeleteBin6Line } from "react-icons/ri";
import { useState } from "react";

export async function loader({ params, request }) {
  // Get the session of the user
  const session = await getSession(request.headers.get("Cookie"));
  
  // Connect to the database
  const db = connectDb();
  
  // Find the course by courseId
  const course = await db.models.Course.findById(params.courseId);
  
  // Find the lessons related to the course
  const lesson = await db.models.Lesson.find({ courseId: params.courseId });

  // If the course is not found, return a 404 response
  if (!course) {
    throw new Response(`Couldn't find course with id ${params.courseId}`, {
      status: 404,
    });
  }

  return json({
    course,
    courseId: params.courseId,
    lesson,
    isAuthenticated: session.has("teacherId"),
  });
}

export default function CoursePage() {
  // Function to format the date, so it look like our dates.
  function formatDate(date) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(date).toLocaleDateString("en-GB", options);
  }

  // Extract data from the loader
  const { course, courseId, isAuthenticated } = useLoaderData();

  // State to manage the confirmation dialog for deletion
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Function to handle the confirmation for deletion
  const handleDeleteConfirm = () => {
    setShowConfirmation(true);
  };

  // Function to handle the cancellation of deletion
  const handleDeleteCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{course.title}</h1>
      <dl className="my-3 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-bold">Education:</dt>
            <dd>{course.education}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-bold">Start Date:</dt>
            <dd>{formatDate(course.startDate)}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-bold">End Date:</dt>
            <dd>{formatDate(course.endDate)}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-bold">ECTS:</dt>
            <dd>{course.ects}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-bold">Semester:</dt>
            <dd>{course.semester}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-bold">Description:</dt>
            <dd>{course.description}</dd>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center md:justify-between">
  <div className="flex flex-col md:flex-row items-center md:space-x-2">
    <Link
      to={`/lesson?courseId=${courseId}`}
      className="w-max rounded-full border-2 border-primary py-1 px-4 text-primary flex items-center space-x-2"
    >
      <span>Gå til lektioner</span>
      <RiArrowRightSLine size={18} />
    </Link>
  </div>
  {isAuthenticated ? (
    <div className="flex flex-col md:flex-row items-center md:space-x-2">
      <Link
        to={`/updateCourse?courseId=${courseId}`}
        className="w-max rounded-full border-2 border-primary py-1 px-4 text-primary flex items-center space-x-2"
      >
        <span>Rediger faget</span>
        <RiEdit2Fill size={18} />
      </Link>
      <form
        method="post"
        className="w-max rounded-full border-2 border-primary py-1 px-4 text-primary flex items-center space-x-2"
      >
        <button
          type="button"
          onClick={handleDeleteConfirm}
          className="flex items-center space-x-1"
        >
          <span>Slet faget og lektioner</span>
          <RiDeleteBin6Line size={18} />
        </button>
      </form>
      <Link
        to={`/addLesson?courseId=${courseId}`}
        className="w-max rounded-full border-2 border-primary py-1 px-4 text-primary flex items-center space-x-2"
      >
        <span>Tilføj lektion</span>
        <RiAddFill size={18} />
      </Link>
    </div>
  ) : (
    <span></span>
  )}
</div>
      </dl>
      {showConfirmation && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Er du sikker på, at du vil slette dette fag?</p>
            <div className="flex justify-end mt-4">
              <form method="post">
                <button
                  type="submit"
                className="px-4 py-2 mr-2 text-red-500 border border-red-500 rounded"
              >
                Slet
                </button>
                </form>
              <button
                className="px-4 py-2 text-gray-500 border border-gray-500 rounded"
                onClick={handleDeleteCancel}
              >
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CatchBoundary() {
  // CatchBoundary component to handle error responses
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

export function ErrorBoundary({ error }) {
  // ErrorBoundary component to handle runtime errors
  return (
    <h1 className="font-bold text-red-500">
      {error.name}: {error.message}
    </h1>
  );
}

export async function action({ params }) {
  // Connect to the database
  const db = connectDb();

  // Delete the course by courseId
  await db.models.Course.findByIdAndDelete(params.courseId);

  // Delete all lessons with courseId matching the course
  await db.models.Lesson.deleteMany({ courseId: params.courseId });

  return redirect("/courses");
}