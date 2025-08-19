import React, { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, UserCheck, User } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { showSuccessToast, showErrorToast, showInfoToast } from "../components/ui/Toast";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  hasPassword: boolean;
  status: string;
}

interface PasswordManagementProps {
  users?: User[];
  onUserUpdate?: () => void;
}

export const PasswordManagement: React.FC<PasswordManagementProps> = ({
  users = [],
  onUserUpdate
}) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Busca usuários que precisam de senha
  const fetchUsersWithoutPassword = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/usuarios`);

      // Filtra usuários ativos e mapeia o status da senha
      const usersData = response.data
        .filter((user: any) => user.status === 'Ativo')
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          hasPassword: !!user.password,
          status: user.status
        }));

      setUsersList(usersData);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      showErrorToast("Erro ao carregar usuários");
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      setUsersList(users);
    } else {
      fetchUsersWithoutPassword();
    }
  }, [users]);

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({
      username: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Definir senha para usuário selecionado
  const handleSetPassword = async () => {
    if (!selectedUser) return;

    // Validações
    if (!formData.newPassword || !formData.confirmPassword) {
      showErrorToast("Por favor, preencha todos os campos");
      return;
    }

    if (formData.newPassword.length < 6) {
      showErrorToast("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showErrorToast("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login/set-password`,
        {
          userId: selectedUser.id,
          newPassword: formData.newPassword,
          username: formData.username,
        }
      );

      if (response.data.success) {
        showSuccessToast(`Senha definida com sucesso para ${selectedUser.name}!`);

        // Atualiza a lista local
        setUsersList(prev =>
          prev.map(user =>
            user.id === selectedUser.id
              ? { ...user, hasPassword: true }
              : user
          )
        );

        // Chama callback se fornecido
        if (onUserUpdate) {
          onUserUpdate();
        }

        closeModal();
      } else {
        showErrorToast(response.data.message || "Erro ao definir senha");
      }
    } catch (error: any) {
      console.error("Erro ao definir senha:", error);
      const message = error?.response?.data?.message || "Erro ao definir senha";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar senha aleatória
  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setFormData({
      username: "",
      newPassword: password,
      confirmPassword: password,
    });

    showInfoToast("Senha aleatória gerada! Copie antes de salvar.");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showInfoToast("Senha copiada para a área de transferência!");
    } catch (error) {
      showErrorToast("Erro ao copiar senha");
    }
  };

  const usersWithoutPassword = usersList.filter(user => !user.hasPassword);
  const usersWithPassword = usersList.filter(user => user.hasPassword);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Senhas</h2>
          <p className="text-gray-600">Configure senhas para os usuários do sistema</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{usersWithoutPassword.length}</div>
            <div className="text-sm text-gray-600">Sem Senha</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{usersWithPassword.length}</div>
            <div className="text-sm text-gray-600">Com Senha</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{usersList.length}</div>
            <div className="text-sm text-gray-600">Total de Usuários</div>
          </div>
        </Card>
      </div>

      {/* Lista de usuários sem senha */}
      {usersWithoutPassword.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Usuários sem senha configurada ({usersWithoutPassword.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersWithoutPassword.map((user) => (
              <Card key={user.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.username && (
                        <p className="text-xs text-blue-600">@{user.username}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Sem senha
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => openPasswordModal(user)}
                    className="w-full"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Definir Senha
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de usuários com senha */}
      {usersWithPassword.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Usuários com senha configurada ({usersWithPassword.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersWithPassword.map((user) => (
              <Card key={user.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.username && (
                        <p className="text-xs text-blue-600">@{user.username}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Com senha
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => openPasswordModal(user)}
                    className="w-full"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal para definir senha */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${selectedUser?.hasPassword ? 'Alterar' : 'Definir'} senha - ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Usuário:</strong> {selectedUser?.name}<br />
              <strong>Email:</strong> {selectedUser?.email}<br />
              {selectedUser?.username && (
                <>
                  <strong>Username:</strong> @{selectedUser.username}
                </>
              )}
            </p>
          </div>

          <div className="relative">
            <Input
              type="text"
              label="Username"
              placeholder="Digite o username do usuário"
              value={formData.username || ""}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              icon={<User className="w-5 h-5 text-gray-400" />}
            />
          </div>

          {/* Input da Nova Senha (em seu próprio div.relative com os ícones) */}
          <div className="relative">
            <Input
              type={showPasswords.new ? "text" : "password"}
              label="Nova senha"
              placeholder="Digite a nova senha (mínimo 6 caracteres)"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              icon={<Key className="w-5 h-5 text-gray-400" />}
            />
            {/* Bloco com os botões de copiar e mostrar/ocultar senha */}
            <div className="absolute right-3 top-9 flex gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(formData.newPassword)}
                className="text-gray-400 hover:text-gray-600"
                disabled={!formData.newPassword}
              >
                📋
              </button>
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              label="Confirmar senha"
              placeholder="Digite novamente a senha"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              icon={<Key className="w-5 h-5 text-gray-400" />}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
              }
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={generateRandomPassword}
            className="w-full"
          >
            🎲 Gerar Senha Aleatória
          </Button>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSetPassword}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Senha"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};