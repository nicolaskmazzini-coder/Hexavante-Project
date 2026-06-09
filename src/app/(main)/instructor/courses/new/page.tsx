import { listCategories } from "@/services/course.service";
import { NewCourseForm } from "./new-course-form";
import { AppLink } from "@/components/ui/app-link";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { BookPlus } from "lucide-react";

export default async function NewCoursePage() {
  const categories = await listCategories();

  return (
    <PageShell>
      <AppLink href="/instructor/courses" muted className="mb-4 inline-flex items-center gap-1">
        ← Meus cursos
      </AppLink>
      <PageHeader
        badge="Instrutor"
        icon={BookPlus}
        title="Novo curso"
        description="Preencha as informações básicas. O curso ficará pendente até aprovação."
      />
      <NewCourseForm categories={categories} />
    </PageShell>
  );
}
