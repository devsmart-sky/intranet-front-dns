import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { Department } from "../types";
import { mockDepartments } from "../services/mockData";
import { usePagination } from "../hooks/usePagination";
import { generateDepartmentsPDF } from "../utils/pdfGenerator";
import {
  showSuccessToast,
  showInfoToast,
  showWarningToast,
} from "../components/ui/Toast";
import { showDeleteConfirmation } from "../utils/alerts";
import axios from "axios";

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [formData, setFormData] = useState<Partial<Department>>({
    departamento: "",
    descricao: "",
    status: "",
  });

  const filteredDepartments = departments.filter(
    (department) =>
      department.departamento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      department.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedDepartments,
    setCurrentPage,
    itemsPerPage,
    totalItems,
  } = usePagination({ data: filteredDepartments, itemsPerPage: 6 });

  const openModal = (
    mode: "view" | "edit" | "create",
    department?: Department
  ) => {
    setModalMode(mode);
    if (department) {
      setSelectedDepartment(department);
      setFormData(department);
    } else {
      setSelectedDepartment(null);
      setFormData({
        departamento: "",
        descricao: "",
        status: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  // Função para buscar departamentos
  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/departamentos`
      );
      setDepartments(response.data);
    } catch (err) {
      console.error("Erro ao buscar departamentos:", err);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  // Função para salvar um departamento
  const handleSave = async () => {
    if (modalMode === "create") {
      // Verificar se já existe um departamento com o mesmo nome
      const existeDepartamento = departments.find(
        (dept) => dept.departamento === formData.departamento
      );
      if (existeDepartamento) {
        showWarningToast("Departamento com o mesmo nome ja existe!");
        return;
      }

      const newDepartment: Department = {
        ...(formData as Department),
        id_departamento: Date.now().toString(),
      };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/departamentos`,
          {
            departamento: formData.departamento,
            descricao: formData.descricao,
            status: formData.status ? "Ativo" : "Inativo",
          }
        );

        // Cria o departamento novo e atualiza a lista de departamentos
        if (response.status === 201) {
          showSuccessToast(
            `Departamento ${newDepartment.departamento} criado com sucesso!`
          );
          fetchDepartamentos();
        }
      } catch (err) {
        console.error("Erro ao criar departamento:", err);
      }

      closeModal();
    } else if (modalMode === "edit" && selectedDepartment) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/departamentos/${Number(
            selectedDepartment.id_departamento
          )}`,
          {
            departamento: formData.departamento,
            descricao: formData.descricao,
            status: formData.status ? "Ativo" : "Inativo",
          }
        );

        if (response.status === 200) {
          showSuccessToast(
            `Departamento ${selectedDepartment.departamento} atualizado com sucesso!`
          );
          fetchDepartamentos();
        }
      } catch (err) {
        console.error("Erro ao atualizar departamento:", err);
      }
    }
    closeModal();
  };

  // Função para excluir um departamento
  const handleDelete = async (id: string) => {
    const department = departments.find((dept) => dept.id_departamento === id);
    const confirmed = await showDeleteConfirmation(
      "Excluir departamento?",
      `Tem certeza que deseja excluir o departamento "${department?.departamento}"? Esta ação não pode ser desfeita.`,
      "Sim, excluir"
    );

    if (confirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/departamentos/${id}`
        );

        if (response.status === 200) {
          setDepartments(
            departments.filter((dept) => dept.id_departamento !== id)
          );
          showSuccessToast(
            `Departamento ${department?.departamento} excluido com sucesso!`
          );
          fetchDepartamentos();
        } else {
          console.error("Erro ao excluir departamento", response.data);
        }
      } catch (err) {
        console.error("Erro ao excluir departamento:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departamentos</h2>
          <p className="text-gray-600">Gerencie os departamentos da empresa</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => {
              generateDepartmentsPDF(filteredDepartments);
              showInfoToast("Relatório PDF gerado com sucesso!");
            }}
          >
            Relatório PDF
          </Button>
          <Button icon={Plus} onClick={() => openModal("create")}>
            Novo Departamento
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <Input
            placeholder="Buscar departamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
          />
        </div>
      </Card>

      {/* Lista de departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDepartments.map((department) => (
          <Card key={department.id_departamento}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {department.departamento}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {department.descricao}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    department.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {department.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Criado em{" "}
                  {department.criado &&
                    new Date(department.criado).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => openModal("view", department)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openModal("edit", department)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(department.id_departamento)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginação inferior fixa em baixo */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Novo Departamento"
            : modalMode === "edit"
            ? "Editar Departamento"
            : "Visualizar Departamento"
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={formData.departamento}
            onChange={(e) =>
              setFormData({ ...formData, departamento: e.target.value })
            }
            disabled={modalMode === "view"}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              disabled={modalMode === "view"}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {modalMode !== "view" && (
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={formData.status === "Ativo"}
                  onChange={() => setFormData({ ...formData, status: "Ativo" })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Ativo</span>
              </label>

              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={formData.status === "Inativo"}
                  onChange={() =>
                    setFormData({ ...formData, status: "Inativo" })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Inativo</span>
              </label>
            </div>
          )}

          {modalMode !== "view" && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {modalMode === "create" ? "Criar" : "Salvar"}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
