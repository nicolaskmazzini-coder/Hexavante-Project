"use client";

import { updateCourseAction } from "@/app/actions/course";
import { CourseFormShell } from "@/components/courses/course-form-shell";

type Props = {
  courseId: string;
  categories: { id: string; name: string }[];
  course: {
    title: string;
    categoryId: string;
    shortDescription: string | null;
    description: string | null;
    coverImage: string | null;
    thumbnailUrl: string | null;
    level: string;
    estimatedHours: number | null;
    progressionType: string;
  };
};

export function EditCourseForm({ courseId, categories, course }: Props) {
  return (
    <CourseFormShell
      categories={categories}
      action={updateCourseAction.bind(null, courseId)}
      initial={course}
      submitLabel="Salvar alterações"
      cancelHref="/instructor/courses"
    />
  );
}
