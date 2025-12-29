import { PrismaClient } from "@prisma/client";
import WeddingForm from "@/components/v1/WeddingForm";
import { getWeddingDetails } from "@/app/actions/wedding";
import Link from "next/link";

const prisma = new PrismaClient();



export default async function WeddingDetailsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = await params; // Await params for Next.js 15
  const weddingData = await getWeddingDetails(projectId);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wedding Configuration</h1>
        <p className="text-gray-500">Manage your main page details and gallery.</p>
      </div>
      
      <Link href={`/w/${projectId}`} className="inline-block mb-6 text-rose-600 hover:underline">Public</Link>
      <WeddingForm projectId={projectId} initialData={weddingData} />
    </main>
  );
}