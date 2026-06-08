import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseCard } from "../courses/course-card";

describe("CourseCard", () => {
  const mockProps = {
    slug: "test-course",
    title: "Test Course",
    shortDescription: "A test course description",
    categoryName: "Programming",
    moduleCount: 5,
    enrollmentCount: 100,
    level: "BEGINNER",
    estimatedHours: 20,
  };

  it("deve renderizar o card do curso", () => {
    render(<CourseCard {...mockProps} />);

    expect(screen.getByText("Test Course")).toBeInTheDocument();
    expect(screen.getByText("A test course description")).toBeInTheDocument();
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getByText("5 módulos")).toBeInTheDocument();
    expect(screen.getByText("100 alunos")).toBeInTheDocument();
    expect(screen.getByText("Iniciante")).toBeInTheDocument();
    expect(screen.getByText("20h")).toBeInTheDocument();
  });

  it("deve exibir nível intermediário", () => {
    const props = { ...mockProps, level: "INTERMEDIATE" };
    render(<CourseCard {...props} />);

    expect(screen.getByText("Intermediário")).toBeInTheDocument();
  });

  it("deve ter link correto para o curso", () => {
    const { container } = render(<CourseCard {...mockProps} />);
    const link = container.querySelector("a");

    expect(link).toHaveAttribute("href", "/courses/test-course");
  });

  it("não deve renderizar descrição se não fornecida", () => {
    const props = { ...mockProps, shortDescription: null };
    render(<CourseCard {...props} />);

    expect(screen.queryByText("A test course description")).not.toBeInTheDocument();
  });
});
