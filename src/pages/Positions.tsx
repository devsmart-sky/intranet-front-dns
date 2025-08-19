import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { Position } from "../types";
import { mockPositions } from "../services/mockData";
import { usePagination } from "../hooks/usePagination";
import { generatePositionsPDF } from "../utils/pdfGenerator";
import { showSuccessToast, showInfoToast } from "../components/ui/Toast";
import { showDeleteConfirmation } from "../utils/alerts";
import axios from "axios";

export const Positions: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [formData, setFormData] = useState<Partial<Position>>({
    cargo: "",
    descricao: "",
    status: "",
  });

  const filteredPositions = positions.filter(
    (position) =>
      position.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedPositions,
    setCurrentPage,
    itemsPerPage,
    totalItems,
  } = usePagination({ data: filteredPositions, itemsPerPage: 6 });

  const openModal = (mode: "view" | "edit" | "create", position?: Position) => {
    setModalMode(mode);
    if (position) {
      setSelectedPosition(position);
      setFormData(position);
    } else {
      setSelectedPosition(null);
      setFormData({
        cargo: "",
        descricao: "",
        status: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  // Função para buscar cargos
  const fetchCargos = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cargos`
      );
      setPositions(response.data);
    } catch (err) {
      console.error("Erro ao buscar cargos:", err);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  // Função para salvar um cargo ou editar
  const handleSave = async () => {
    if (modalMode === "create") {
      const newPosition: Position = {
        ...(formData as Position),
        id_cargo: new Date().toISOString(),
      };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/cargos`,
          {
            cargo: formData.cargo,
            descricao: formData.descricao,
            status: formData.status ? "Ativo" : "Inativo",
          }
        );

        if (response.status === 201) {
          showSuccessToast(`Cargo ${newPosition.cargo} criado com sucesso!`);
          fetchCargos();
        }
      } catch (err) {
        console.error("Erro ao criar cargo:", err);
      }

      closeModal();
    } else if (modalMode === "edit" && selectedPosition) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/cargos/${Number(
            selectedPosition.id_cargo
          )}`,
          {
            cargo: formData.cargo,
            descricao: formData.descricao,
            status: formData.status,
          }
        );

        if (response.status === 200) {
          showSuccessToast(
            `Cargo ${selectedPosition.cargo} atualizado com sucesso!`
          );
          fetchCargos();
        }
      } catch (err) {
        console.error("Erro ao atualizar cargo:", err);
      }
      closeModal();
    }
  };

  // Função para excluir um cargo
  const handleDelete = async (id: string) => {
    const position = positions.find((pos) => pos.id_cargo === id);
    const confirmed = await showDeleteConfirmation(
      "Excluir cargo?",
      `Tem certeza que deseja excluir o cargo "${position?.cargo}"? Esta ação não pode ser desfeita.`,
      "Sim, excluir"
    );

    if (confirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/cargos/${id}`
        );

        if (response.status === 200) {
          setPositions(positions.filter((pos) => pos.id_cargo !== id));
          showSuccessToast(`Cargo ${position?.cargo} excluido com sucesso!`);
          fetchCargos();
        } else {
          console.error("Erro ao excluir cargo", response.data);
        }
      } catch (err) {
        console.error("Erro ao excluir cargo:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cargos</h2>
          <p className="text-gray-600">Gerencie os cargos da empresa</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => {
              generatePositionsPDF(filteredPositions);
              showInfoToast("Relatório PDF gerado com sucesso!");
            }}
          >
            Relatório PDF
          </Button>
          <Button icon={Plus} onClick={() => openModal("create")}>
            Novo Cargo
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <Input
            placeholder="Buscar cargos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
          />
        </div>
      </Card>

      {/* Positions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPositions.map((position) => (
          <Card key={position.id_cargo}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {position.cargo}
                  </h3>
                  <p className="text-sm text-gray-600">{position.descricao}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    position.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {position.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Criado em{" "}
                  {position.criado &&
                    new Date(position.criado).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => openModal("view", position)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openModal("edit", position)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(position.id_cargo)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fixed Bottom Pagination */}
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
            ? "Novo Cargo"
            : modalMode === "edit"
            ? "Editar Cargo"
            : "Visualizar Cargo"
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={formData.cargo}
            onChange={(e) =>
              setFormData({ ...formData, cargo: e.target.value })
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
            <div className="flex items-center mb-4">
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
                  className="h-4 w-4 ml-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
