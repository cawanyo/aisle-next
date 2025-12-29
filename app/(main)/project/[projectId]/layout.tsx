import { ProjectSidebar } from "@/components/v1/ProjectSidebar";


interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>; // Params are async in Next.js 15
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const { projectId } = await params;

  return (
    <div className="min-h-screen bg-white flex">
      <ProjectSidebar projectId={projectId} />
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}