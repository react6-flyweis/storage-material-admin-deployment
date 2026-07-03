import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { adminRoutes } from "./routes/admin.routes";
import { Loading } from "./components/loading";
import { SocketProvider } from "./utils/socketContextProvider";

const router = createBrowserRouter(adminRoutes);

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SocketProvider>
    </Suspense>
  );
}

export default App;
