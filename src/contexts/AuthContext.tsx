import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser, LoginCredentials, Notification } from "../types";
import { showErrorToast, showSuccessToast } from "../components/ui/Toast";
import axios from "axios";

interface AuthContextType {
  user: AuthUser | null;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; message?: string }>;
  loginWithUserData: (userData: AuthUser) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  updateProfile: (data: {
    photoFile?: File | null;
    [key: string]: any;
  }) => Promise<void>;
  showBirthdayBanner: boolean;
  hideBirthdayBanner: () => void;
  // refreshOnlineUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBirthdayBanner, setShowBirthdayBanner] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Bem-vindo ao sistema!",
      message:
        "Sua conta foi criada com sucesso. Explore todas as funcionalidades disponíveis.",
      type: "success",
      fromUserId: "system",
      fromUserName: "Sistema",
      toUserId: "1",
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Nova política de home office",
      message:
        "Uma nova política de trabalho remoto foi aprovada. Confira os detalhes na seção de notícias.",
      type: "info",
      fromUserId: "admin",
      fromUserName: "Administrador",
      toUserId: "1",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Configuração global do Axios
  useEffect(() => {
    // Interceptor para adicionar o token às requisições
    axios.interceptors.request.use(config => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("sessionToken");
      if (token && config.url?.startsWith('/intranet/api')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratamento global de erros
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
          showErrorToast("Sessão expirada. Faça login novamente.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject();
      axios.interceptors.response.eject();
    };
  }, []);

  // const updateOnlineStatus = async () => {
  //   console.log(user);
  //   if (!user) return;
  //   try {
  //     await axios.post(
  //       'https://portal.smartsky.tech/intranet/api/online',
  //       { userId: user.id || user.email }, // fallback
  //       { timeout: 3000 }
  //     );
  //     console.log(`Status online atualizado para: ${status}`);
  //   } catch (error) {
  //     console.warn('Erro ao atualizar status online:', error);
  //   }
  // };

  useEffect(() => {
    const initializeAuth = async () => {
      try {

        // Primeiro verifica sessionStorage (F5)
        const sessionUser = sessionStorage.getItem("sessionUser");
        const sessionToken = sessionStorage.getItem("sessionToken");

        if (sessionUser && sessionToken) {

          const parsedUser = JSON.parse(sessionUser);
          setUser(parsedUser);

          // Atualiza status online em background
          // setTimeout(() => {
          //   updateOnlineStatus().catch(console.error);
          // }, 1000);

          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // Se não há session, verifica localStorage (login normal)
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {

          // Salva também no sessionStorage para persistência no F5
          sessionStorage.setItem("sessionUser", savedUser);
          sessionStorage.setItem("sessionToken", savedToken);

          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Atualiza status online em background
          // setTimeout(() => {
          //   updateOnlineStatus().catch(console.error);
          // }, 1000);

          // Validação do token em background (não bloqueante)
          axios.get(`${window.location.origin}/intranet/api/auth/validate`, {
            headers: { Authorization: `Bearer ${savedToken}` },
            timeout: 5000
          }).catch(() => {
            console.log("Validação de token em background falhou - mantendo sessão");
          });
        }
      } catch (error) {
        console.error("❌ Erro na inicialização:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);

      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  // Função para atualizar status online (chamada manual)
  // const refreshOnlineUsers = async () => {
  //   if (!user?.email) return;
  //   try {
  //     await axios.get(
  //       `${window.location.origin}/intranet/api/online`,
  //       {
  //         params: { email: user.email },
  //         timeout: 3000,
  //       }
  //     );
  //     console.log("✅ Status online atualizado com sucesso");
  //   } catch (error) {
  //     console.warn("❌ Erro ao atualizar status online:", error);
  //   }
  // };

  const unreadCount = notifications.filter(
    (n) => !n.isRead && n.toUserId === user?.id
  ).length;

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.toUserId === user?.id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Função para buscar dados do Office 365 após login
  const fetchOffice365Data = async (email: string): Promise<any | null> => {
    try {
      const response = await axios.get(
        `${window.location.origin}/intranet/api/office365/usuarios?email=${email}`
      );
      return response.data;
    } catch (error) {
      console.warn("⚠️ Não foi possível buscar dados do Office 365:", error);
      return null;
    }
  };

  const updateProfile = async (data: {
    photoFile?: File | null;
    [key: string]: any;
  }) => {
    if (!user) throw new Error("Usuário não está logado");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name || "");
      formData.append("email", data.email || "");

      if (data.photoFile) {
        formData.append("photo", data.photoFile);
      }

      const response = await axios.put(
        `${window.location.origin}/intranet/api/usuarios/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Atualiza o usuário no estado e storage
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      sessionStorage.setItem("sessionUser", JSON.stringify(updatedUser));

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hideBirthdayBanner = () => {
    setShowBirthdayBanner(false);
  };

  const loginWithUserData = async (userData: AuthUser) => {
    try {
      if (!userData.id || !userData.email) {
        throw new Error('Dados do usuário incompletos: faltam id ou email');
      }

      const completeUserData: AuthUser = {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions || {},
        photo: userData.photo,
        status: userData.status || 'Ativo',
        token: userData.token,
        office365: userData.office365 || {
          displayName: "",
          jobTitle: "",
          department: "",
          mobilePhone: "",
          businessPhones: ""
        }
      };

      setUser(completeUserData);
      localStorage.setItem("user", JSON.stringify(completeUserData));
      localStorage.setItem("token", userData.token || "");
      sessionStorage.setItem("sessionUser", JSON.stringify(completeUserData));
      sessionStorage.setItem("sessionToken", userData.token || "");

      // await updateOnlineStatus();
      setShowBirthdayBanner(true);

    } catch (error) {
      console.error("❌ AuthContext - Erro ao processar login SSO:", error);
      throw error;
    }
  };

  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${window.location.origin}/intranet/api/login`,
        credentials
      );

      const data = response.data;

      const authUser: AuthUser = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        permissions: data.user.permissions,
        photo: data.user.photo,
        status: data.user.status,
        token: data.token,
        office365: {
          displayName: "",
          jobTitle: "",
          department: "",
          mobilePhone: "",
          businessPhones: ""
        }
      };

      // Tenta buscar dados do Office 365
      try {
        const office365Data = await fetchOffice365Data(authUser.email);
        if (office365Data) {
          const enrichedUser: AuthUser = {
            ...authUser,
            name: authUser.name || office365Data.displayName,
            photo: office365Data.photo || authUser.photo,
            office365: {
              displayName: office365Data.displayName,
              jobTitle: office365Data.jobTitle,
              department: office365Data.department,
              mobilePhone: office365Data.mobilePhone,
              businessPhones: office365Data.businessPhones,
            }
          };
          setUser(enrichedUser);
          localStorage.setItem("user", JSON.stringify(enrichedUser));
          sessionStorage.setItem("sessionUser", JSON.stringify(enrichedUser));
        } else {
          setUser(authUser);
          localStorage.setItem("user", JSON.stringify(authUser));
          sessionStorage.setItem("sessionUser", JSON.stringify(authUser));
        }
      } catch (office365Error) {
        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
        sessionStorage.setItem("sessionUser", JSON.stringify(authUser));
      }

      localStorage.setItem("token", data.token);
      sessionStorage.setItem("sessionToken", data.token);

      // await updateOnlineStatus();
      setShowBirthdayBanner(true);

      showSuccessToast("Login realizado com sucesso!");
      return { success: true };

    } catch (error: any) {
      console.error("❌ AuthContext - Erro no login:", error);
      const message = error?.response?.data?.message || "Erro ao fazer login";
      showErrorToast(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Atualizar status offline antes de limpar
    if (user) {
      // Usando fetch com keepalive para garantir que a requisição seja enviada
      fetch(`${window.location.origin}/intranet/api//offline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
        keepalive: true // Garante que a requisição seja completada mesmo após navegador fechar
      }).catch(console.error);
    }

    // Limpa ambos storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("sessionUser");
    sessionStorage.removeItem("sessionToken");

    setUser(null);
    setShowBirthdayBanner(false);

    // Chamada opcional ao backend para logout
    axios.put(`${window.location.origin}/intranet/api/logout`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).catch(console.error);
  };

  const contextValue: AuthContextType = {
    user,
    login,
    loginWithUserData,
    logout,
    isLoading,
    notifications: notifications.filter((n) => n.toUserId === user?.id),
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateProfile,
    showBirthdayBanner,
    hideBirthdayBanner,
    // refreshOnlineUsers,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};