import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  );
}
