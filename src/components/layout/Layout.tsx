import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import Background from "../../../public/background-smartsky.jpeg";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onPageChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = (page: string) => {
    const titles = {
      dashboard: "Dashboard",
      funcionarios: "Colaboradores",
      // positions: "Cargos",
      organograma: "Organograma",
      departments: "Departamentos",
      documents: "Documentos",
      news: "Comunicados",
      users: "Usuários",
      // passwordManagement: "Gerenciamento de Senhas",
    };
    return titles[page as keyof typeof titles] || "Intranet";
  };

  return (
    <div
      className="h-screen bg-gray-50 flex overflow-hidden relative"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay para controlar a opacidade */}
      <div className="absolute inset-0 bg-gray-100/5 backdrop-blur-md"></div>

      {/* Conteúdo com z-index para ficar acima do overlay */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          currentPage={currentPage}
          onPageChange={onPageChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            title={getPageTitle(currentPage)}
          />

          <main className="p-4 lg:p-6 flex-1 overflow-y-auto">
            <div className="pb-20">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
