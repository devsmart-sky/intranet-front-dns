import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  X,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import {
  showSuccessToast,
  showInfoToast,
  showErrorToast,
} from "../components/ui/Toast";
import axios from "axios";
import { Colaboradores, OrgNode } from "../types";

export const Organograma: React.FC = () => {
  const [orgData, setOrgData] = useState<OrgNode[]>([]);
  const [filteredData, setFilteredData] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Colaboradores | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Função para conectar com Microsoft Graph API
  const fetchFromOffice365 = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/office365/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("office365_token")}`,
          "Content-Type": "application/json",
        },
      });

      const employees: Colaboradores[] = response.data.value;
      const orgChart = buildOrgChart(employees);
      setOrgData(orgChart);
      setFilteredData(orgChart);
      showSuccessToast("Organograma sincronizado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar dados do Office365:", error);
      showErrorToast("Erro ao conectar com Office365");
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Função para construir a estrutura hierárquica
  const buildOrgChart = (employees: Colaboradores[]): OrgNode[] => {
    const employeeMap = new Map<string, Colaboradores>();
    employees.forEach((emp) => employeeMap.set(emp.id, emp));

    const rootNodes: OrgNode[] = [];
    const processedIds = new Set<string>();

    const createNode = (
      employee: Colaboradores,
      level: number = 0
    ): OrgNode => {
      const node: OrgNode = {
        id: employee.id,
        name: employee.displayName,
        title: employee.jobTitle,
        email: employee.mail,
        department: employee.department,
        manager: employee.manager?.id,
        children: [],
        level,
        isExpanded: level < 2,
      };

      employee.directReports.forEach((report) => {
        if (!processedIds.has(report.id)) {
          processedIds.add(report.id);
          node.children.push(createNode(report, level + 1));
        }
      });

      return node;
    };

    employees.forEach((employee) => {
      if (!employee.manager && !processedIds.has(employee.id)) {
        processedIds.add(employee.id);
        rootNodes.push(createNode(employee));
      }
    });

    return rootNodes;
  };

  // Dados mock para desenvolvimento
  const loadMockData = () => {
    const mockData: OrgNode[] = [
      {
        id: "1",
        name: "João Silva",
        title: "CEO",
        email: "joao.silva@empresa.com",
        department: "Diretoria",
        level: 0,
        isExpanded: true,
        children: [
          {
            id: "2",
            name: "Maria Santos",
            title: "Diretora de Recursos Humanos",
            email: "maria.santos@empresa.com",
            department: "Recursos Humanos",
            manager: "1",
            level: 1,
            isExpanded: true,
            children: [
              {
                id: "5",
                name: "Pedro Costa",
                title: "Gerente de RH",
                email: "pedro.costa@empresa.com",
                department: "Recursos Humanos",
                manager: "2",
                level: 2,
                isExpanded: false,
                children: [],
              },
            ],
          },
          {
            id: "3",
            name: "Carlos Oliveira",
            title: "Diretor de Tecnologia",
            email: "carlos.oliveira@empresa.com",
            department: "Tecnologia",
            manager: "1",
            level: 1,
            isExpanded: true,
            children: [
              {
                id: "6",
                name: "Ana Ferreira",
                title: "Tech Lead",
                email: "ana.ferreira@empresa.com",
                department: "Tecnologia",
                manager: "3",
                level: 2,
                isExpanded: false,
                children: [],
              },
            ],
          },
          {
            id: "4",
            name: "Lucia Pereira",
            title: "Diretora Financeira",
            email: "lucia.pereira@empresa.com",
            department: "Financeiro",
            manager: "1",
            level: 1,
            isExpanded: true,
            children: [],
          },
        ],
      },
    ];
    setOrgData(mockData);
    setFilteredData(mockData);
  };

  useEffect(() => {
    loadMockData();
  }, []);

  // Função de busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(orgData);
      return;
    }

    const filterNodes = (nodes: OrgNode[]): OrgNode[] => {
      return nodes.reduce((filtered: OrgNode[], node) => {
        const matches =
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.department.toLowerCase().includes(searchTerm.toLowerCase());

        const filteredChildren = filterNodes(node.children);

        if (matches || filteredChildren.length > 0) {
          filtered.push({
            ...node,
            children: filteredChildren,
            isExpanded: matches || filteredChildren.length > 0,
          });
        }

        return filtered;
      }, []);
    };

    setFilteredData(filterNodes(orgData));
  }, [searchTerm, orgData]);

  // Função para alternar expansão
  const toggleNode = (nodeId: string) => {
    const updateNodes = (nodes: OrgNode[]): OrgNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        return { ...node, children: updateNodes(node.children) };
      });
    };

    const updated = updateNodes(orgData);
    setOrgData(updated);
    if (!searchTerm) {
      setFilteredData(updated);
    }
  };

  // Função para visualizar detalhes do funcionário
  const viewEmployeeDetails = async (nodeId: string) => {
    try {
      const response = await axios.get(`/api/office365/users/${nodeId}`);
      setSelectedEmployee(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes do funcionário:", error);
      showErrorToast("Erro ao carregar detalhes do funcionário");
    }
  };

  // Função para gerar relatório
  const generateReport = () => {
    showInfoToast("Gerando relatório do organograma...");
  };

  // Controles de zoom
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoomLevel(1);

  // Função para entrar/sair do fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setZoomLevel(1); // Reset zoom quando entra no fullscreen
    }
  };

  // Renderização do nó do organograma
  const renderNode = (node: OrgNode) => {
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Nó principal */}
        <div
          className={`relative bg-white border-2 rounded-lg p-4 shadow-md cursor-pointer transition-all hover:shadow-lg ${
            node.level === 0
              ? "border-blue-500 bg-blue-50"
              : node.level === 1
              ? "border-green-500 bg-green-50"
              : "border-gray-300"
          }`}
          style={{ minWidth: "200px" }}
          onClick={() => viewEmployeeDetails(node.id)}
        >
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 text-sm">{node.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{node.title}</p>
            <p className="text-xs text-gray-500">{node.department}</p>
          </div>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-50"
            >
              {node.isExpanded ? "−" : "+"}
            </button>
          )}
        </div>

        {/* Linha conectora vertical */}
        {hasChildren && node.isExpanded && (
          <div className="w-px h-8 bg-gray-300"></div>
        )}

        {/* Filhos */}
        {hasChildren && node.isExpanded && (
          <div className="flex flex-col items-center">
            {/* Linha horizontal */}
            <div className="h-px bg-gray-300 w-full mb-8"></div>

            {/* Nós filhos */}
            <div className="flex flex-wrap justify-center gap-8">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Linha conectora para cada filho */}
                  <div className="w-px h-8 bg-gray-300 -mt-8"></div>
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componente Fullscreen
  const FullscreenView = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header fixo */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Organograma - Modo Tela Cheia
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={zoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button size="sm" variant="secondary" onClick={zoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={resetZoom}>
              Reset
            </Button>
          </div>
          <Button size="sm" onClick={toggleFullscreen}>
            <X className="w-4 h-4 mr-2" />
            Sair da Tela Cheia
          </Button>
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 flex justify-center min-h-full">
          <div
            className="inline-block"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top center",
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Carregando organograma...</span>
              </div>
            ) : filteredData.length > 0 ? (
              <div className="flex flex-col items-center space-y-8">
                {filteredData.map((node) => renderNode(node))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm
                    ? "Nenhum funcionário encontrado"
                    : "Nenhum dado disponível"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Se estiver em fullscreen, renderiza apenas a visualização fullscreen
  if (isFullscreen) {
    return (
      <>
        <FullscreenView />
        {/* Modal ainda pode aparecer sobre o fullscreen */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Detalhes do Funcionário"
        >
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.displayName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.jobTitle}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.mail}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.department}
                  </p>
                </div>
                {selectedEmployee.officeLocation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedEmployee.officeLocation}
                    </p>
                  </div>
                )}
                {selectedEmployee.mobilePhone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedEmployee.mobilePhone}
                    </p>
                  </div>
                )}
              </div>
              {selectedEmployee.manager && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gerente
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.manager.displayName}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* <h2 className="text-2xl font-bold text-white">Organograma</h2> */}
          <p className="text-2xl text-gray-300">
            Visualize a estrutura organizacional da empresa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" icon={FileText} onClick={generateReport}>
            Relatório
          </Button>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchFromOffice365}
            disabled={loading}
          >
            {loading ? "Sincronizando..." : "Sincronizar Office365"}
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Buscar funcionário, cargo ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={zoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button size="sm" variant="secondary" onClick={zoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={resetZoom}>
                Reset
              </Button>
              <Button size="sm" variant="secondary" onClick={toggleFullscreen}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Organograma - Visualização Normal */}
      <Card>
        <div className="overflow-auto" style={{ maxHeight: "90vh" }}>
          <div className="p-40 flex justify-center">
            <div
              className="inline-block"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Carregando organograma...</span>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="flex flex-col items-center space-y-8">
                  {filteredData.map((node) => renderNode(node))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Nenhum funcionário encontrado"
                      : "Nenhum dado disponível"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de detalhes do funcionário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalhes do Funcionário"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-sm text-gray-900">
                  {selectedEmployee.displayName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <p className="text-sm text-gray-900">
                  {selectedEmployee.jobTitle}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{selectedEmployee.mail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <p className="text-sm text-gray-900">
                  {selectedEmployee.department}
                </p>
              </div>
              {selectedEmployee.officeLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.officeLocation}
                  </p>
                </div>
              )}
              {selectedEmployee.mobilePhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.mobilePhone}
                  </p>
                </div>
              )}
            </div>
            {selectedEmployee.manager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gerente
                </label>
                <p className="text-sm text-gray-900">
                  {selectedEmployee.manager.displayName}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
