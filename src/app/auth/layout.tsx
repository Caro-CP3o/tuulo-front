import Banner from "../components/atoms/Banner";
import SidebarMenu from "../components/organisms/menu/SidebarMenu";
import TopMenu from "../components/organisms/menu/TopMenu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 w-full z-[9999]">
        <TopMenu />
        <Banner />
      </div>
      <div className="grid grid-cols-4 min-h-screen mx-auto">
        <aside className="col-span-1 pt-[300px] min-h-screen">
          <SidebarMenu />
        </aside>
        <main className="col-span-3 mt-[364px]">{children}</main>
      </div>
    </>
  );
}
