import { Outlet } from "react-router";
import { useDarkMode } from "./providers/DarkModeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "./components/Footer";
import { GradientWrapper } from "./components/GradientWrapper";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

export function Layout() {
  const { isDarkMode } = useDarkMode();

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Navigation />
        <main className="mt-[80px]">
          <GradientWrapper isDarkMode={isDarkMode}>
            <Outlet />
          </GradientWrapper>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
