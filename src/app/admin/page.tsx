import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = {
  title: "Admin | STS Alumni Association",
};

export default function AdminPage() {
  return <AdminApp />;
}
