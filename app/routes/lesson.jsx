import { useLoaderData, useCatch, Link, Outlet } from "@remix-run/react";
import { json } from "@remix-run/node";
import connectDb from "~/db/connectDb.server.js";
import { requireTeacherSession } from "~/sessions.server";
import Calendar from "react-calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

export async function loader({ params, request }) {
  const session = await requireTeacherSession(request);
  const db = connectDb();
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");
  const lesson = await db.models.Lesson.find({
    courseId: courseId,
  });

  // Set the courseId in the session
  session.set("courseId", courseId);

  return json({ courseId, lesson });
}

export default function CoursePage() {
  function formatDate(date) {
    const options = { day: "2-digit" };
    return new Date(date).toLocaleDateString("en-GB", options);
  }

  let { lesson, courseId } = useLoaderData();

  if (!lesson) {
    lesson = [];
  }

  function getLessonTitle(date) {
    const lessonItem = lesson.find((lessonItem) => {
      const lessonDate = new Date(lessonItem.date);
      return (
        lessonDate.getDate() === date.getDate() &&
        lessonDate.getMonth() === date.getMonth() &&
        lessonDate.getFullYear() === date.getFullYear()
      );
    });

    return lessonItem ? lessonItem.title : "";
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Lektioner</h1>
      <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-2/4 mx-auto">
        <Calendar
          tileContent={({ date }) => (
            <div>
              <p>{formatDate(date)}</p>
              <p className="text-lg font-bold">
                {getLessonTitle(date)}
                {lesson.map((lessonItem) => {
                  const lessonDate = new Date(lessonItem.date);
                  if (
                    lessonDate.getDate() === date.getDate() &&
                    lessonDate.getMonth() === date.getMonth() &&
                    lessonDate.getFullYear() === date.getFullYear()
                  ) {
                    return (
                      <Link
                        key={lessonItem._id}
                        to={`/lesson/${lessonItem._id}?courseId=${courseId}`}
                        className="text-blue-500"
                      >
                        <br />
                        Se Lektion
                      </Link>
                    );
                  }
                  return null;
                })}
              </p>
            </div>
          )}
          tileClassName="text-center border p-2"
          formatDay={() => null} // Fjerner dagstal
          prevLabel={<ChevronLeftIcon className="h-5 w-5" />}
          nextLabel={<ChevronRightIcon className="h-5 w-5" />}
          prev2Label={<ChevronLeftIcon className="h-5 w-5" />}
          next2Label={<ChevronRightIcon className="h-5 w-5" />}
        />
      </div>
      <Outlet />
    </div>
  );
}

export function CatchBoundary() {
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
  return (
    <h1 className="font-bold text-red-500">
      {error.name}: {error.message}
    </h1>
  );
}
