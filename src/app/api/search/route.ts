import { NextResponse } from "next/server";
import { searchApprovedCourses } from "@/services/course.service";
import { searchPublishedExams } from "@/services/exam.service";
import { extractClientIp, rateLimitSearch } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = extractClientIp(
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip"),
  );
  if (!rateLimitSearch(ip)) {
    return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (q.length > 100) {
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
