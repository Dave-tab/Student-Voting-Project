import { Navigate, type RouteObject } from "react-router-dom";
import RootLayout from "@/components/layouts/RootLayout";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Activate from "@/pages/Activate";
import Profile from "@/pages/Profile";
import Elections from "@/pages/Elections";
import ElectionDetails from "@/pages/ElectionDetails";
import BallotPage from "@/pages/BallotPage";
import ReviewPage from "@/pages/ReviewPage";
import CompletionPage from "@/pages/CompletionPage";
import ResultsPage from "@/pages/ResultsPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AdminRoute } from "@/features/admin/components/AdminRoute";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminElectionsPage from "@/pages/admin/AdminElectionsPage";
import AdminElectionManagePage from "@/pages/admin/AdminElectionManagePage";
import AdminSuperAdminOversight from "@/pages/admin/AdminSuperAdminOversight";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "elections",
        element: <Elections />,
      },
      {
        path: "elections/:id",
        element: <ElectionDetails />,
      },
      {
        path: "elections/:id/ballot",
        element: <BallotPage />,
      },
      {
        path: "elections/:id/review",
        element: <ReviewPage />,
      },
      {
        path: "elections/:id/completed",
        element: <CompletionPage />,
      },
      {
        path: "elections/:id/results",
        element: <ResultsPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "elections",
        element: <AdminElectionsPage />,
      },
      {
        path: "elections/:id",
        element: <AdminElectionManagePage />,
      },
      {
        path: "oversight",
        element: <AdminSuperAdminOversight />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/activate",
    element: <Activate />,
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
