import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./index.css";
import { AppLayout } from "./AppLayout";
import { UploadPage } from "./pages/UploadPage";
import { FileBySlugPage } from "./pages/FileBySlugPage";
import { FileByCodePage } from "./pages/FileByCodePage";
import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./theme";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <UploadPage /> },
      { path: "upload", element: <Navigate to="/" replace /> },
      { path: "f/:slug", element: <FileBySlugPage /> },
      { path: "c/:code", element: <FileByCodePage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);
