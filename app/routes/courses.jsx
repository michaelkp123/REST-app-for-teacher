import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { useState } from "react";
import connectDb from "~/db/connectDb.server.js";
import { requireTeacherSession } from "~/sessions.server";

export async function loader({ request }) {
  const session = await requireTeacherSession(request);
  const db = connectDb();
  let courses = await db.models.Course.find();

  // If the teacher is logged in, fetch only the courses associated with that teacher
  if (session.get("teacherId") !== undefined) {
    courses = await db.models.Course.find({
      responsibleTeacher: session.get("teacherId"),
    });
  }

  // Fetch the teacher's details
  const teacher = await db.models.Teacher.findById(session?.get("teacherId"));

  return { courses, teacher };
}

export default function Index() {
  const { courses, teacher } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");

  let filteredCourses = courses;
  const sanitizedSearchTerm = searchTerm.toLowerCase().trim();

  // Filter the courses based on the search term
  if (sanitizedSearchTerm) {
    filteredCourses = courses.filter((course) => {
      return (
        course.title.toLowerCase().includes(sanitizedSearchTerm) ||
        course.description.toLowerCase().includes(sanitizedSearchTerm)
      );
    });
  }

  // Sort the filtered courses by title
  filteredCourses.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="gap-4 md:grid md:grid-cols-2">
      <div className="mb-5 border-blue-600 md:mb-0 md:mr-3 md:border-r md:pr-5">
        {teacher && (
          <div className="mb-4">
            <strong>Navn:</strong> {teacher.teacherName}
            <strong style={{ marginLeft: '20px' }}>Email:</strong> {teacher.email}
          </div>
        )}

        <h1 className="mb-4 text-2xl font-bold">Mine fag</h1>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Søg efter titel eller beskrivelse"
          className="mb-3 w-full rounded border border-blue-600 p-2"
        />
        <ul className="ml-5 list-disc">
          {filteredCourses.map((course) => {
            return (
              <li key={course._id}>
                <Link
                  to={`/courses/${course._id}`}
                  className="text-blue-600 hover:underline"
                >
                  {course.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}