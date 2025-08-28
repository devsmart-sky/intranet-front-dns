import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Upload,
  FileText,
  Lock,
  Globe,
  Users as UsersIcon,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Document } from "../types";
import { mockDocuments } from "../services/mockData";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../components/ui/Toast";
import { showDeleteConfirmation } from "../utils/alerts";
import axios from "axios";

export const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [documentos, setDocumentos] = useState<Document[]>([]);
  const [formData, setFormData] = useState<Partial<Document>>({
    nome: "",
    descricao: "",
    categoria: "",
    nivel: "Público",
    isActive: true,
  });

  const openModal = (mode: "view" | "edit" | "create", document?: Document) => {
    setModalMode(mode);
    if (document) {
      setSelectedDocument(document);
      setFormData({
        ...document,
        nivel: document.nivel ?? "Público",
      });
    } else {
      setSelectedDocument(null);
      setFormData({
        nome: "",
        descricao: "",
        categoria: "",
        nivel: "Público",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  // Função para envio de documentos
  const handleSave = async () => {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];

    const form = new FormData();
    form.append("nome", formData.nome);
    form.append("descricao", formData.descricao);
    form.append("categoria", formData.categoria);
    form.append("nivel", formData.nivel);
    form.append("isActive", String(formData.isActive));

    if (file) {
      form.append("documento", file);
    }

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/documento`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        showSuccessToast("Documento criado com sucesso!");
      } else if (modalMode === "edit" && selectedDocument?.id_documento) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/documento/${
            selectedDocument.id_documento
          }`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        showSuccessToast("Documento atualizado com sucesso!");
      }

      closeModal();
      getDocuments();
    } catch (err) {
      console.error(err);
      showErrorToast("Erro ao salvar documento.");
    }
  };

  // Função para exclusão de documentos
  const handleDelete = async (id: string) => {
    const document = documents.find((doc) => doc.id_documento === id);
    const confirmed = await showDeleteConfirmation(
      "Excluir documento?",
      `Tem certeza que deseja excluir o documento "${document?.nome}"? Esta ação não pode ser desfeita.`,
      "Sim, excluir"
    );

    if (confirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/documento/${id}`
        );
        setDocumentos((prev) => prev.filter((doc) => doc.id_documento !== id)); // Atualizar a lista de documentos();
        showSuccessToast("Documento excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir documento:", error);
        showErrorToast("Erro ao excluir documento");
      }
    }
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getAccessIcon = (nivel: string) => {
    switch (nivel) {
      case "Público":
        return <Globe className="w-4 h-4 text-green-600" />;
      case "Restrito":
        return <UsersIcon className="w-4 h-4 text-yellow-600" />;
      case "Admin":
        return <Lock className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-green-600" />;
    }
  };

  const getAccessLabel = (nivel: string) => {
    switch (nivel) {
      case "Público":
        return "Público";
      case "Restrito":
        return "Restrito";
      case "Admin":
        return "Administradores";
      default:
        return "Público";
    }
  };

  // Função para lidar com o envio do formulário de upload de documentos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        arquivo: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }
  };

  // Função para buscar documentos e fazer o download
  const getDocuments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/documento`
      );

      const docsComUrls = response.data.map((doc: Document) => ({
        ...doc,
        fileUrl: `${import.meta.env.VITE_API_URL}/docs/${doc.arquivo}`, // <- Aqui o caminho de download
      }));

      setDocumentos(docsComUrls);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);

      return;
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  // Filtrar documentos com base no termo de busca
  const filteredDocuments = documentos.filter((doc) => {
    const matchesSearch =
      doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    // Check access permissions
    if (doc.nivel === "Público") return matchesSearch;
    if (doc.nivel === "Admin" && user?.role !== "admin") return false;
    if (doc.nivel === "Restrito") {
      if (user?.role === "admin") return matchesSearch;
      // if (doc.allowedRoles?.includes(user?.role as any)) return matchesSearch;
      // if (doc.allowedUsers?.includes(user?.email as string)) return matchesSearch;
      return false;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* <h2 className="text-2xl font-bold text-white">Documentos</h2> */}
          <p className="text-2xl text-gray-300">
            Gerencie os documentos da empresa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button icon={Plus} onClick={() => openModal("create")}>
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
            {/* <Button variant="secondary" icon={Filter}>
              Filtros
            </Button> */}
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id_documento}>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {document.nome}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {document.descricao}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {document.categoria}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getAccessIcon(document.nivel)}
                      <span className="text-xs text-gray-500">
                        {getAccessLabel(document.nivel)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                <p>Arquivo: {document.arquivo}</p>
                {/* <p>Tamanho: {formatFileSize(document.fileSize)}</p> */}
                <p>
                  Enviado em:{" "}
                  {new Date(document.criado).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Modal de visualização */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => openModal("view", document)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => window.open(document.fileUrl, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {user?.role === "admin" && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => openModal("edit", document)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(document.id_documento)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Novo Documento"
            : modalMode === "edit"
            ? "Editar Documento"
            : "Visualizar Documento"
        }
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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

          <Input
            label="Categoria"
            value={formData.categoria}
            onChange={(e) =>
              setFormData({ ...formData, categoria: e.target.value })
            }
            disabled={modalMode === "view"}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Acesso
            </label>
            <select
              value={formData.nivel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nivel: e.target.value as "Público" | "Restrito" | "Admin",
                })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Público">Público</option>
              <option value="Restrito">Restrito</option>
            </select>
          </div>

          {modalMode !== "view" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="secondary" icon={Upload}>
                  Upload
                </Button>
              </div>
              {formData.arquivo && (
                <p className="text-sm text-gray-600 mt-1">
                  Arquivo selecionado: {formData.arquivo}
                </p>
              )}
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
