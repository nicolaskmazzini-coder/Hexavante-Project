"use client";

import { createCourseAction } from "@/app/actions/course";
import { CourseFormShell } from "@/components/courses/course-form-shell";

type Props = {
  categories: { id: string; name: string }[];
};

export function NewCourseForm({ categories }: Props) {
  return (
    <CourseFormShell
      categories={categories}
      action={createCourseAction}
      submitLabel="Criar curso"
      cancelHref="/instructor/courses"
    />
  );
}
