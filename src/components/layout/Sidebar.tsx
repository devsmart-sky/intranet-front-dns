import React from "react";
// import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users as UsersIcon,
  FileText,
  Newspaper,
  LogOut,
  X,
  UserRoundCog,
  Building,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../../public/horizontal_branco.svg";
import { UserPermissions } from "../../types";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isOpen,
  onToggle,
}) => {
  const { logout, user } = useAuth();

  const hasPermission = (permissionKey: keyof UserPermissions) => {
    // Se for admin, tem acesso a tudo
    if (user?.role === "admin") return true;

    // Se tiver lista de permissões, verifica se inclui o key
    return user?.permissions?.[permissionKey];
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      canView: true,
    }, // Dashboard sempre visível
    {
      id: "funcionarios",
      label: "Colaboradores",
      icon: UsersIcon,
      canView: hasPermission("canViewFuncionarios"),
    },
    // {
    //   id: "positions",
    //   label: "Cargos",
    //   icon: Network,
    //   canView: hasPermission("canViewPositions"),
    // },
    {
      id: "organograma",
      label: "Organograma",
      icon: Building,
      canView: hasPermission("canViewOrganograma"),
    },
    // {
    //   id: "departments",
    //   label: "Organograma",
    //   icon: Building,
    //   canView: hasPermission("canViewDepartments"),
    // },
    {
      id: "documents",
      label: "Documentos",
      icon: FileText,
      canView: hasPermission("canViewDocuments"),
    },
    {
      id: "news",
      label: "Comunicados",
      icon: Newspaper,
      canView: hasPermission("canViewNews"),
    },
    {
      id: "users",
      label: "Usuários",
      icon: UserRoundCog,
      canView: hasPermission("canViewUsers"),
    },
    // {
    //   id: "passwordManagement",
    //   label: "Gerenciamento",
    //   icon: KeyRound,
    //   canView: hasPermission("canViewPasswordManagement"),
    // },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static left-0 top-0 h-full lg:h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white transform transition-transform duration-300 ease-in-out z-50 lg:z-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Building2 className="w-5 h-5" />
              </div> */}
              {/* <h1 className="text-lg font-bold">Intranet - SmartSky</h1> */}

              <img src={Logo} alt="Logo" className="w-30 h-10" />
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col">
          <nav className="p-4 flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                // Renderiza o item apenas se o usuário tiver permissão ou se for o dashboard (que é sempre visível)
                if (!item.canView && item.id !== "dashboard") {
                  // Se for o dashboard, ele sempre aparece. Para outros, se não tiver permissão, não renderiza.
                  return null;
                }
                const Icon = item.icon; // Componente de ícone

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onPageChange(item.id);
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        currentPage === item.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Acessos rapidos */}
          <div className="p-4 border-t border-gray-700 mt-auto">
            <div className="mb-3">
              <div className="text-xl text-white space-y-1">
                <center>
                  <label>Acessos rapidos</label>
                </center>
                <br />
                <div className="flex items-center space-x-8 mt-4">
                  <div className="flex flex-col items-center">
                    <a
                      href="https://smartsky-helpdesk.atlassian.net/servicedesk/customer/portal/2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="jira.png"
                        alt="Jira"
                        className="w-12 h-16 object-contain hover:scale-105 transition-transform"
                        title="Abertura de chamados T.I"
                      />
                    </a>
                    <span className="text-sm mt-2">Jira</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <a
                      href="https://smartsky.sienge.com.br/sienge/8/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="sienge.png"
                        alt="Sienge"
                        className="w-20 h-16 object-contain hover:scale-105 transition-transform"
                        title="Sistema Sienge"
                      />
                    </a>
                    <span className="text-sm mt-2">Sienge</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <a
                      href="https://flashapp.com.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="flash.png"
                        alt="Sienge"
                        className="w-16 h-16 object-contain hover:scale-105 transition-transform"
                        title="Sistema Flash"
                      />
                    </a>
                    <span className="text-sm mt-2">Flash</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700 mt-auto">
            <div className="mb-3">
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  Última atualização:
                  <span className="text-white font-medium"> 28/08/2025 </span>
                </p>
                <p>
                  Versão: <span className="text-white font-medium"> v1.0</span>
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
