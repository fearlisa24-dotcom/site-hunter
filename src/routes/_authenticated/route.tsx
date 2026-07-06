import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { initLeadsStore, clearLeadsStore } from "@/lib/leads-store";
import { initSearchesStore, clearSearchesStore } from "@/lib/searches-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } as any });
    }
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  const { user } = Route.useRouteContext();

  useEffect(() => {
    initLeadsStore(user.id);
    initSearchesStore(user.id);
    return () => {
      clearLeadsStore();
      clearSearchesStore();
    };
  }, [user.id]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
