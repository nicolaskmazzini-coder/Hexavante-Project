import { listCategories } from "@/services/course.service";
import { NewCourseForm } from "./new-course-form";
import Link from "next/link";

export default async function NewCoursePage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/instructor/courses" className="text-sm text-indigo-600 hover:underline">
        ← Meus cursos
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Novo curso</h1>
      <div className="mt-8">
        <NewCourseForm categories={categories} />
      </div>
    </div>
  );
}
