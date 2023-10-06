import Navbar from "@/components/Navbar/Navbar";
import Content from "./Content";
import { findUserStore } from "@/lib/findUserStore";
import { store } from "@/types";
export const metadata = {
  title: "Dashboard",
};
type Props = { storeId: string };

export default async function DashboardPage({ storeId }: Props) {
  let store: store | null;
  store = await findUserStore(storeId);
  console.log("store: ", store);
  return (
    <div>
      <Content store={store} />
    </div>
  );
}
