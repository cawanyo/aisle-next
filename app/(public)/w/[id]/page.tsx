import { getPublicWeddingData } from "@/app/actions/public";
import { notFound } from "next/navigation";
import PublicWeddingView from "@/components/v1/PublicWeddingView";

export default async function PublicWeddingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch data on the server
  const data = await getPublicWeddingData(id);

  if (!data) return notFound();

  // Pass data to the Client Component for animation rendering
  return <PublicWeddingView data={data} projectId={id} />;
}