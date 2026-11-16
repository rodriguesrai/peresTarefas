import { AppHeader } from "@/components/layout/app-header";
import { requireUser } from "@/features/auth/lib/dal";

// Tudo dentro de (app) exige login.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
