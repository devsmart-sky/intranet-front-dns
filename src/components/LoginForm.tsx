import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import Logo from "../../public/horizonal_colorido.svg";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { showErrorToast } from "./ui/Toast";
import Background from "../../public/background-smartsky.jpeg";

// Configurações Azure AD
const AZURE_CONFIG = {
  CLIENT_ID: 'a16fa914-5401-4174-9c1d-7d63d8459f23',
  TENANT_ID: 'e91a6cc0-d5e7-4937-8d70-78729dbc6b92',
  REDIRECT_URI: 'https://portal.smartsky.tech/intranet',
  SCOPE: 'openid profile email User.Read'
};

export const LoginForm: React.FC = () => {
  const [loginType, setLoginType] = useState<"sso" | "credentials">("credentials");
  const [credentialsType, setCredentialsType] = useState<"email" | "username">("email");
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  // Função corrigida para SSO Azure AD
  // function LoginSingleSignon() {
  //   setIsLoading(true); // Mostrar loading imediatamente
  //   try {
  //     // // Gerar um state aleatório para segurança
  //     // const state = Math.random().toString(36).substring(2, 15) +
  //     //   Math.random().toString(36).substring(2, 15);

  //     // // Salvar o state no sessionStorage para validação posterior
  //     // sessionStorage.setItem('azure_auth_state', state);

  //     // Construir URL de autorização do Azure AD
  //     const authUrl = new URL(`https://login.microsoftonline.com/${AZURE_CONFIG.TENANT_ID}/oauth2/v2.0/authorize`);

  //     // authUrl.searchParams.append('client_id', AZURE_CONFIG.CLIENT_ID);
  //     // authUrl.searchParams.append('response_type', 'code');
  //     // authUrl.searchParams.append('redirect_uri', AZURE_CONFIG.REDIRECT_URI);
  //     // authUrl.searchParams.append('scope', AZURE_CONFIG.SCOPE);
  //     // authUrl.searchParams.append('state', state);
  //     // authUrl.searchParams.append('response_mode', 'query');

  //     // Redirecionar para Azure AD
  //     window.location.href = authUrl.toString();
  //     setIsLoading(true)

  //   } catch (error) {
  //     console.error("Erro ao iniciar SSO:", error);
  //     showErrorToast("Erro ao iniciar autenticação SSO");
  //   }
  // }

  function LoginSingleSignon() {
    window.location.href = "http://172.16.11.18:5000/api/singleSignon";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emailOrUsername || !formData.password) {
      showErrorToast("Por favor, preencha todos os campos");
      return;
    }

    const payload: any = {
      password: formData.password,
      loginType: credentialsType
    };

    if (credentialsType === "email") {
      payload.email = formData.emailOrUsername;
    } else {
      payload.username = formData.emailOrUsername;
    }

    setIsLoading(true);
    try {
      const result = await login(payload);

      if (!result.success) {
        showErrorToast(result.message || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      showErrorToast("Erro interno no sistema");
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${Background})` }}
      ></div>

      {/* Overlay opcional para melhor contraste */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={Logo} alt="Logo Smart Sky" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Intranet</h1>
            <p className="text-gray-600">Sistema de Gestão Interna</p>
          </div>

          {/* Seletor de tipo de login */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginType("credentials")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === "credentials"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Email/Senha
            </button>
            <button
              type="button"
              onClick={() => setLoginType("sso")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === "sso"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              SSO Smart Sky
            </button>
          </div>

          {/* Formulário de login com credenciais */}
          {loginType === "credentials" && (
            <>
              {/* Seletor Email/Usuário */}
              <div className="flex mb-4 bg-gray-50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setCredentialsType("email")}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${
                    credentialsType === "email"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setCredentialsType("username")}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${
                    credentialsType === "username"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  Usuário
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type={credentialsType === "email" ? "email" : "text"}
                    placeholder={
                      credentialsType === "email" ? "seu@email.com" : "Usuário"
                    }
                    value={formData.emailOrUsername}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailOrUsername: e.target.value,
                      })
                    }
                    icon={
                      credentialsType === "email" ? (
                        <Mail className="w-5 h-5 text-gray-400" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )
                    }
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    icon={<Lock className="w-5 h-5 text-gray-400" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </>
          )}

          {/* Botão SSO */}
          {loginType === "sso" && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={LoginSingleSignon}
              >
                Entrar com Smart Sky
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};