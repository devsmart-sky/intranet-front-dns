import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  FileText,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { PhotoCapture } from "../components/ui/PhotoCapture";
import { User } from "../types";
import { usePagination } from "../hooks/usePagination";
import { generateUsersPDF } from "../utils/pdfGenerator";
import {
  showSuccessToast,
  showInfoToast,
  showErrorToast,
} from "../components/ui/Toast";
import { showDeleteConfirmation } from "../utils/alerts";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [filraFuncionarios, setFiltraFuncionarios] = useState<
    { id_funcionario: number; funcionario: string; email: string }[]
  >([]);
  const [formData, setFormData] = useState<Partial<User>>({
    // username: '',
    name: "",
    email: "",
    role: "user",
    status: "Ativo",
    photo: null,
    photoFile: null,
  });

  // ✅ Adicionando useAuth para acessar o usuário logado
  const { user: authUser } = useAuth();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedUsers,
    setCurrentPage,
    itemsPerPage,
    totalItems,
  } = usePagination({ data: filteredUsers, itemsPerPage: 6 });

  // ✅ NOVO: useEffect para sincronizar a foto do usuário logado
  useEffect(() => {
    // Se o usuário logado existe e a lista de usuários não está vazia
    if (authUser && users.length > 0) {
      // Cria uma nova lista de usuários
      const newUsers = users.map((u) => {
        // Se o usuário na lista é o mesmo que o usuário logado
        if (u.id === authUser.id) {
          // Retorna o objeto do usuário com a nova foto do AuthContext
          return { ...u, photo: authUser.photo as string | null | undefined };
        }
        return u;
      });
      // Atualiza o estado da lista apenas se houver uma mudança
      if (JSON.stringify(newUsers) !== JSON.stringify(users)) {
        setUsers(newUsers as User[]);
      }
    }
  }, [authUser, users]);

  const openModal = (mode: "view" | "edit" | "create", userToEdit?: User) => {
    setModalMode(mode);
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setFormData({
        ...userToEdit,
        photoFile: null,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        // username: '',
        name: "",
        email: "",
        role: "user",
        status: "Ativo",
        photo: null,
        photoFile: null,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Funcação para buscar usuários
  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/usuarios`
      );

      const fetchedUsers = response.data.map((user: User) => ({
        ...user,
        // Garante que o status seja 'Ativo' ou 'Inativo'
        status: user.status === "Ativo" ? "Ativo" : "Inativo",
      }));

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      showErrorToast("Erro ao buscar usuários");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Buscar funcionarios por e-mail
  const fetchFuncionariosEmail = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/usuarios/filtraFuncionario`
      );
      if (Array.isArray(response.data)) {
        setFiltraFuncionarios(response.data);

        if (response.data.length === 0) {
          showInfoToast(
            "Todos os funcionários já possuem usuários criados",
            1000
          );
        }
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setFiltraFuncionarios([]);
    }
  };

  useEffect(() => {
    fetchFuncionariosEmail();
  }, []);

  // ✅ Função para salvar o usuário
  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("name", formData.name || "");
      data.append("email", formData.email || "");
      data.append("role", formData.role || "user");
      data.append("status", formData.status || "Ativo");
      data.append("id_funcionario", formData.id_funcionario?.toString() || "");

      if (formData.photoFile) {
        data.append("photo", formData.photoFile, formData.photoFile.name);
      } else if (
        modalMode === "edit" &&
        selectedUser?.photo &&
        formData.photo
      ) {
        data.append("photoExistente", selectedUser.photo);
      }

      if (modalMode === "create") {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/usuarios`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // ✅ VERIFICAÇÃO DE ERRO PARA CRIAÇÃO
        if (response.data.error) {
          showErrorToast(response.data.message || "Email já cadastrado!");
          return;
        }

        showSuccessToast("Usuário criado com sucesso!");
      } else if (modalMode === "edit" && selectedUser) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/usuarios/${selectedUser.id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // ✅ VERIFICAÇÃO DE ERRO PARA EDIÇÃO
        if (response.data.error) {
          showErrorToast(response.data.message || "Erro ao atualizar usuário!");
          return;
        }

        showSuccessToast("Usuário atualizado com sucesso!");
      }

      fetchUsuarios();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      showErrorToast("Erro ao salvar usuário.");
    }
  };

  // ✅ Função handleSaveUser (para criação de usuário após funcionário)
  const handleSaveUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/funcionarios/criaUsuario`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
      );

      closeModal();

      if (response.data.success) {
        showSuccessToast(`Usuário ${formData.name} criado com sucesso!`);
      } else {
        showErrorToast(response.data.message || "Erro ao criar usuário.");
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);

      // ✅ TRATAMENTO MELHORADO DE ERROS
      if (error.response?.status === 400 && error.response?.data?.message) {
        showErrorToast(error.response.data.message);
      } else if (error.response?.status === 404) {
        showErrorToast("Funcionário não encontrado");
      } else if (error.response?.status >= 500) {
        showErrorToast("Erro interno do servidor");
      } else {
        showErrorToast("Erro ao criar usuário.");
      }
    } finally {
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    const confirmed = await showDeleteConfirmation(
      "Excluir usuário?",
      `Tem certeza que deseja excluir o usuário "${userToDelete?.name}"? Esta ação não pode ser desfeita.`,
      "Sim, excluir"
    );

    if (confirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/usuarios/${id}`
        );
        showSuccessToast("Usuário excluído com sucesso!");
        fetchUsuarios(); // Atualiza a lista após excluir
      } catch (err) {
        console.error("Erro ao excluir usuário:", err);
        showErrorToast("Erro ao excluir usuário.");
      }
    }
  };

  const toggleUserStatus = async (id: string) => {
    const userToToggle = users.find((u) => u.id === id);
    if (!userToToggle) return;

    const newStatus = userToToggle.status === "Ativo" ? "Inativo" : "Ativo";

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, {
        ...userToToggle, // Envia todos os dados existentes
        status: newStatus,
      });
      showSuccessToast(
        `Usuário ${
          newStatus === "Ativo" ? "ativado" : "desativado"
        } com sucesso!`,
        1500
      );
      fetchUsuarios(); // Atualiza a lista
    } catch (err) {
      console.error("Erro ao alterar status do usuário:", err);
      showErrorToast("Erro ao alterar status do usuário.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuários</h2>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => {
              generateUsersPDF(filteredUsers);
              showInfoToast("Relatório PDF gerado com sucesso!");
            }}
          >
            Relatório PDF
          </Button>
          <Button icon={Plus} onClick={() => openModal("create")}>
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
          />
        </div>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedUsers.map((user) => (
          <Card key={user.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                    {user ? (
                      user.photo ? (
                        <img
                          src={
                            typeof user.photo === "string"
                              ? user.photo
                              : undefined
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      )
                    ) : null}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1 gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role === "admin" ? "Administrador" : "Usuário"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => openModal("view", user)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openModal("edit", user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.status === "Ativo" ? "danger" : "success"}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(user.id)}
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
            ? "Novo Usuário"
            : modalMode === "edit"
            ? "Editar Usuário"
            : "Visualizar Usuário"
        }
      >
        <div className="space-y-4">
          <PhotoCapture
            currentPhoto={formData.photo}
            onPhotoChange={(photoUrl) =>
              setFormData({ ...formData, photo: photoUrl, photoFile: null })
            }
            className="mb-6"
            disabled={modalMode === "view"}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funcionário
            </label>
            <select
              value={formData.id_funcionario || ""}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                const selectedFuncionario = filraFuncionarios.find(
                  (f) => f.id_funcionario === selectedId
                );

                setFormData((prev) => ({
                  ...prev,
                  id_funcionario: selectedId.toString(),
                  name: selectedFuncionario?.funcionario || "",
                  email: selectedFuncionario?.email || "",
                }));
              }}
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um funcionário</option>
              {filraFuncionarios.map((f) => (
                <option key={f.id_funcionario} value={f.id_funcionario}>
                  {f.email}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nome"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={
              modalMode === "view" ||
              modalMode === "edit" ||
              modalMode === "create"
            }
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Acesso
            </label>
            <select
              value={formData.role || "user"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "admin" | "user",
                })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {modalMode !== "view" && (
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.status === "Ativo"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.checked ? "Ativo" : "Inativo",
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Ativo
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
