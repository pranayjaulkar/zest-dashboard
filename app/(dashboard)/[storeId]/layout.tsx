import Navbar from "@/components/Navbar/Navbar";
type Props = {
  children: React.ReactNode;
  params: { storeId: string };
};

export default async function DashboardLayout({ children }: Props) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
