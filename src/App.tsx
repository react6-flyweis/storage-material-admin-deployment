import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { adminRoutes } from "./routes/admin.routes";
import { Loading } from "./components/loading";
import { SocketProvider } from "./utils/socketContextProvider";
import ErrorBoundary from "./pages/error-page";

const router = createBrowserRouter(adminRoutes);

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <SocketProvider>
          <RouterProvider router={router} />
          <Toaster />
        </SocketProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
