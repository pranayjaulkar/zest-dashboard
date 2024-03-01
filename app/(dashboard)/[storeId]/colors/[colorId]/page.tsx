import prismadb from "@/lib/prismadb";
import ColorForm from "./(components)/ColorForm";

export default async function ColorPage({
  params,
}: {
  params: { colorId: string };
}) {
  const color = await prismadb.color.findUnique({
    where: {
      id: params.colorId,
    },
  });

  const newColor = {
    id: color?.id,
    value: color?.value,
    name: color?.name,
  };
  return (
    <div className="flex-col max-w-screen-xl mx-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initialData={newColor} />
      </div>
    </div>
  );
}
