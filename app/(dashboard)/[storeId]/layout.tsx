import Navbar from "@/components/Navbar/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
