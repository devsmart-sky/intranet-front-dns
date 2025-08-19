import React, { useState } from "react";
import { Menu, Bell, User, Settings, LogOut, Users, Wifi } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { PhotoCapture } from "../ui/PhotoCapture";
import { showSuccessToast, showErrorToast } from "../ui/Toast";

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  const {
    user,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateProfile,
    logout,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photo: user?.photo || null,
    photoFile: null as File | null,
  });

  // Mock de usuários online
  const onlineUsers = [
    {
      id: "1",
      name: "Administrator",
      email: "admin@intranet.com",
      role: "admin",
      lastActivity: new Date(),
      isOnline: true,
    },
    {
      id: "2",
      name: "João Silva",
      email: "joao@intranet.com",
      role: "user",
      lastActivity: new Date(Date.now() - 5 * 60 * 1000),
      isOnline: true,
    },
    {
      id: "3",
      name: "Maria Santos",
      email: "maria@intranet.com",
      role: "user",
      lastActivity: new Date(Date.now() - 15 * 60 * 1000),
      isOnline: false,
    },
  ];

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleProfileSave = async () => {
    try {
      setIsUpdatingProfile(true);

      // Só envia para o servidor se houver uma nova foto
      if (profileData.photoFile) {
        await updateProfile({
          photoFile: profileData.photoFile,
          photo: profileData.photo,
        });
        showSuccessToast("Foto do perfil atualizada com sucesso!");
      } else {
        showSuccessToast("Nenhuma alteração realizada.");
      }

      setShowProfileModal(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showErrorToast("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const openProfileModal = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      photo: user?.photo || null,
      photoFile: null,
    });
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-gray-600 hover:text-gray-900 mr-3"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Online Users */}
            <div className="relative">
              <button
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className="text-gray-600 hover:text-gray-900 transition-colors relative"
              >
                <Users className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </button>

              {showOnlineUsers && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      Usuários Online
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {onlineUsers.map((onlineUser) => (
                      <div
                        key={onlineUser.id}
                        className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {onlineUser.name.charAt(0)}
                              </span>
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                onlineUser.isOnline
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {onlineUser.name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  onlineUser.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {onlineUser.role === "admin"
                                  ? "Admin"
                                  : "Usuário"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {onlineUser.isOnline
                                  ? "Online"
                                  : formatTimeAgo(onlineUser.lastActivity)}
                              </span>
                            </div>
                          </div>
                          <Wifi
                            className={`w-4 h-4 ${
                              onlineUser.isOnline
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-600 hover:text-gray-900 transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Notificações
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                          className={`p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                            !notification.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium ${
                                  !notification.isRead
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  De: {notification.fromUserName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Perfil do usuário */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.photo ? (
                    <img
                      src={
                        typeof user.photo === "string" &&
                        user.photo.startsWith("data:")
                          ? user.photo
                          : `${import.meta.env.VITE_API_URL}/uploads/${
                              user.photo
                            }`
                      }
                      alt="Foto do usuário"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.photo ? (
                          <img
                            src={
                              typeof user.photo === "string" &&
                              user.photo.startsWith("data:")
                                ? user.photo
                                : `${import.meta.env.VITE_API_URL}/uploads/${
                                    user.photo
                                  }`
                            }
                            alt="Foto do usuário"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {user?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 pr-16">
                        <p className="font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <div className="flex flex-col space-y-1 gap-1">
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          <span
                            className={`px-2 py-1 text-xs rounded-md ${
                              user?.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user?.role === "admin"
                              ? "Administrador"
                              : "Usuário"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={openProfileModal}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Editar Perfil</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setProfileData({
            name: user?.name || "",
            email: user?.email || "",
            photo: user?.photo || null,
            photoFile: null,
          });
        }}
        title="Editar Perfil"
      >
        <div className="space-y-4">
          <PhotoCapture
            currentPhoto={profileData.photo}
            onPhotoChange={(file, photoUrl) => {
              setProfileData({
                ...profileData,
                photo: photoUrl,
                photoFile: file,
              });
            }}
            className="mb-6"
          />

          <Input
            disabled={true}
            label="Nome"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
          />

          <Input
            disabled={true}
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData({ ...profileData, email: e.target.value })
            }
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Informações da Conta
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nível de Acesso:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user?.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user?.role === "admin" ? "Administrador" : "Usuário"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Ativo</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowProfileModal(false);
                setProfileData({
                  name: user?.name || "",
                  email: user?.email || "",
                  photo: user?.photo || null,
                  photoFile: null,
                });
              }}
              disabled={isUpdatingProfile}
            >
              Cancelar
            </Button>
            <Button onClick={handleProfileSave} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
