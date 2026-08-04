import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type AdminShellContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const value = useMemo<AdminShellContextValue>(
    () => ({ sidebarOpen, setSidebarOpen }),
    [sidebarOpen],
  );
  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell(): AdminShellContextValue {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error("useAdminShell must be used within an AdminShellProvider");
  }
  return context;
}
