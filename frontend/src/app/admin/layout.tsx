// src/app/admin/layout.tsx
import { LayoutWrapper } from "@/components/admin/layout-wrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
