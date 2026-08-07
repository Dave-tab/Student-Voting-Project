import { Navigate, type RouteObject } from "react-router-dom";
import RootLayout from "../../components/layout/RootLayout";
import Home from "../../pages/Home";
import NotFound from "../../pages/NotFound";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "/404",
    element: <NotFound />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];