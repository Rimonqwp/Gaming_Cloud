import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/admin",
    lazy: () =>
      import("./pages/AdminRoutePage").then((module) => ({
        Component: module.AdminRoutePage,
      })),
  },
  {
    path: "/admin-test",
    lazy: () =>
      import("./pages/admin_test").then((module) => ({
        Component: module.AdminDashboardPage,
      })),
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      {
        path: "games",
        lazy: () =>
          import("./pages/GamesPage").then((module) => ({
            Component: module.GamesPage,
          })),
      },
      {
        path: "minecraft",
        lazy: () =>
          import("./pages/MinecraftPage").then((module) => ({
            Component: module.MinecraftPage,
          })),
      },
      {
        path: "support",
        lazy: () =>
          import("./pages/SupportPage").then((module) => ({
            Component: module.SupportPage,
          })),
      },
      {
        path: "support/category/:categoryId",
        lazy: () =>
          import("./pages/DocCategoryPage").then((module) => ({
            Component: module.DocCategoryPage,
          })),
      },
      {
        path: "support/article/:articleId",
        lazy: () =>
          import("./pages/DocArticlePage").then((module) => ({
            Component: module.DocArticlePage,
          })),
      },
      {
        path: "deploy",
        lazy: () =>
          import("./pages/DeployPage").then((module) => ({
            Component: module.DeployPage,
          })),
      },
      {
        path: "dashboard",
        lazy: () =>
          import("./pages/UserDashboardPage").then((module) => ({
            Component: module.UserDashboardPage,
          })),
      },
    ],
  },
]);
