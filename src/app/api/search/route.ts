import { NextResponse } from "next/server";
import { searchApprovedCourses } from "@/services/course.service";
import { searchPublishedExams } from "@/services/exam.service";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [courses, exams] = await Promise.all([
    searchApprovedCourses({ q, sort: "popular" }),
    searchPublishedExams({ q, sort: "popular" }),
  ]);

  const results = [
    ...courses.slice(0, 4).map((course) => ({
      title: course.title,
      href: `/courses/${course.slug}`,
      type: "curso" as const,
    })),
    ...exams.slice(0, 4).map((exam) => ({
      title: exam.title,
      href: `/simulados/${exam.slug}`,
      type: "simulado" as const,
    })),
  ].slice(0, 8);

  return NextResponse.json({ results });
}
