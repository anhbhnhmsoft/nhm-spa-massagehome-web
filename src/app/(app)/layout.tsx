import BottomNav from "@/components/bottom-nav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col ">
      {/* Nội dung trang */}
      <main className="flex-1 pb-16 ">{children}</main>

      {/* Thanh điều hướng cố định phía dưới */}
      <BottomNav />
    </div>
  );
}
