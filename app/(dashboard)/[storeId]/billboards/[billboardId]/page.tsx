import prisma from "@/prisma/client";
import BillboardForm from "./(components)/BillboardForm";

export default async function BillboardPage({ params }: { params: { billboardId: string } }) {
  const billboard = await prisma.billboard.findUnique({
    where: {
      id: params.billboardId,
    },
  });

  return (
    <div className="flex-col max-w-screen-xl mx-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
}
