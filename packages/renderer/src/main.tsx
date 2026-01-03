import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./routes/App.tsx";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router";

const router = createHashRouter([
  {
    path: "/",
    Component: App,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
