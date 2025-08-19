// import React, { useState, useEffect } from "react";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import { ToastContainer, showErrorToast, showSuccessToast } from "./components/ui/Toast";
// import { LoginForm } from "./components/LoginForm";
// import { Layout } from "./components/layout/Layout";
// import { Dashboard } from "./pages/Dashboard";
// import { Funcionarios } from "./pages/Funcionarios";
// import { Positions } from "./pages/Positions";
// import { Organograma } from "./pages/Organograma";
// import { Departments } from "./pages/Departments";
// import { Documents } from "./pages/Documents";
// import { NewsPage } from "./pages/News";
// import { Users } from "./pages/Users";
// import { PasswordManagement } from "./pages/PasswordManagement";

// const AppContent: React.FC = () => {
//   const { user, isLoading, loginWithUserData } = useAuth();
//   const [currentPage, setCurrentPage] = useState("dashboard");
//   const [ssoProcessing, setSsoProcessing] = useState(false);

//   console.log(user)

//   // ✅ Processar SSO callback
//   useEffect(() => {
//     const processSSO = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const userParam = urlParams.get("user");
//       const errorParam = urlParams.get("error");
//       const codeParam = urlParams.get("code");

//       console.log("🔍 Processando SSO callback...");
//       console.log("- userParam:", !!userParam);
//       console.log("- errorParam:", errorParam);
//       console.log("- codeParam:", !!codeParam);
//       console.log("- user atual:", !!user);

//       // ✅ Se há erro no SSO
//       if (errorParam) {
//         console.error("❌ Erro SSO:", errorParam);
//         setSsoProcessing(false);
        
//         let errorMessage = "Erro na autenticação SSO";
        
//         switch (errorParam) {
//           case 'user_not_found':
//             const emailParam = urlParams.get("email");
//             errorMessage = `Usuário ${emailParam || ''} não encontrado no sistema. Entre em contato com o administrador.`;
//             break;
//           case 'login_failed':
//             errorMessage = "Falha na autenticação. Tente novamente.";
//             break;
//           case 'azure_error':
//             const messageParam = urlParams.get("message");
//             errorMessage = `Erro do Azure AD: ${messageParam || 'Erro desconhecido'}`;
//             break;
//           case 'no_code':
//             errorMessage = "Código de autorização não recebido do Azure AD";
//             break;
//           default:
//             errorMessage = `Erro: ${errorParam}`;
//         }
        
//         showErrorToast(errorMessage);
        
//         // Limpar URL após mostrar erro
//         window.history.replaceState({}, document.title, window.location.pathname);
//         return;
//       }

//       // ✅ Se há dados do usuário (retorno do backend após processar)
//       if (userParam && !user) {
//         console.log("✅ Dados do usuário recebidos via SSO");
//         setSsoProcessing(true);
        
//         try {
//           const userData = JSON.parse(decodeURIComponent(userParam));
//           console.log("📋 Dados do usuário:", userData);

//           // Salvar o token no localStorage
//           if (userData.token) {
//             localStorage.setItem("token", userData.token);
//             console.log("💾 Token salvo no localStorage");
//           }

//           // Remover o token dos dados do usuário antes de passar para o contexto
//           const { token, ...userInfo } = userData;

//           // Fazer login usando os dados recebidos
//           await loginWithUserData(userInfo);
          
//           console.log("🎉 Login SSO realizado com sucesso");
//           showSuccessToast("Login realizado com sucesso!");

//           // Limpar a URL
//           window.history.replaceState({}, document.title, window.location.pathname);
          
//         } catch (error) {
//           console.error("❌ Erro ao processar dados SSO:", error);
//           showErrorToast("Erro ao processar dados de autenticação");
          
//           // Limpar URL em caso de erro
//           window.history.replaceState({}, document.title, window.location.pathname);
//         } finally {
//           setSsoProcessing(false);
//         }
//       }

//       // ✅ Se há apenas código (primeira vez vindo do Azure) - APENAS MOSTRAR LOADING
//       if (codeParam && !userParam && !errorParam && !user) {
//         console.log("🔄 Código de autorização detectado, aguardando backend processar...");
//         setSsoProcessing(true);
        
//         // ❌ NÃO redirecionar aqui - deixar o backend processar naturalmente
//         // O backend vai processar e retornar com ?user= ou ?error=
        
//         // Timeout de segurança para evitar loading infinito
//         setTimeout(() => {
//           if (!user && ssoProcessing) {
//             console.warn("⚠️ Timeout no processamento SSO - possível erro no backend");
//             showErrorToast("Timeout no processamento de autenticação. Verifique os logs do servidor.");
//             setSsoProcessing(false);
//             window.history.replaceState({}, document.title, window.location.pathname);
//           }
//         }, 15000); // 15 segundos
//       }
//     };

//     processSSO();
//   }, [user, loginWithUserData]);

//   // Loading screen durante processamento SSO ou carregamento normal
//   if (isLoading || ssoProcessing) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-gray-800 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">
//             {ssoProcessing ? "Processando autenticação..." : "Carregando..."}
//           </h2>
//           <p className="text-gray-600">
//             {ssoProcessing ? "Aguarde enquanto validamos suas credenciais" : "Inicializando sistema..."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <LoginForm />;
//   }

//   const renderPage = () => {
//     switch (currentPage) {
//       case "dashboard":
//         return <Dashboard onPageChange={setCurrentPage} />;
//       case "funcionarios":
//         return <Funcionarios />;
//       case "positions":
//         return <Positions />;
//       case "organograma":
//         return <Organograma />;
//       case "departments":
//         return <Departments />;
//       case "documents":
//         return <Documents />;
//       case "news":
//         return <NewsPage />;
//       case "users":
//         return <Users />;
//       case "passwordManagement":
//         return <PasswordManagement />;
//       default:
//         return <Dashboard onPageChange={setCurrentPage} />;
//     }
//   };

//   return (
//     <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
//       {renderPage()}
//     </Layout>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <ToastContainer />
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer, showErrorToast, showSuccessToast } from "./components/ui/Toast";
import { LoginForm } from "./components/LoginForm";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Funcionarios } from "./pages/Funcionarios";
import { Positions } from "./pages/Positions";
import { Organograma } from "./pages/Organograma";
import { Departments } from "./pages/Departments";
import { Documents } from "./pages/Documents";
import { NewsPage } from "./pages/News";
import { Users } from "./pages/Users";
import { PasswordManagement } from "./pages/PasswordManagement";

const AppContent: React.FC = () => {
  const { user, isLoading, loginWithUserData } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // ✅ Processar SSO callback CORRIGIDO
  useEffect(() => {
  const processSSO = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user'); 
    
    if (userParam && !user) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        // Validação adicional:
        if (!userData.token) {
          throw new Error('Token não encontrado nos dados do usuário');
        }
        await loginWithUserData(userData);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Erro ao processar SSO:', error);
        // Tratamento de erro adequado
      }
    }
  };
  processSSO();
}, [user, loginWithUserData]);

  // 🔄 Loading screen aprimorado
  if (isLoading) {
    let loadingMessage = "Carregando sistema...";
    let loadingDescription = "Inicializando sistema...";
    let showProgress = false;
    
    if (isLoading) {
      loadingMessage = "Processando autenticação SSO...";
      loadingDescription = "Aguarde enquanto validamos suas credenciais com o Azure AD";
      showProgress = true;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-gray-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          {/* Spinner animado */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {loadingMessage}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {loadingDescription}
          </p>
          
          {showProgress && (
            <>
              {/* Barra de progresso simulada */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              
              <div className="text-xs text-gray-400">
                Este processo pode levar até 30 segundos
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 🔍 Se não há usuário logado, mostrar tela de login
  if (!user) {
    return <LoginForm />;
  }

  // 📱 Renderizar página baseado na navegação
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onPageChange={setCurrentPage} />;
      case "funcionarios":
        return <Funcionarios />;
      case "positions":
        return <Positions />;
      case "organograma":
        return <Organograma />;
      case "departments":
        return <Departments />;
      case "documents":
        return <Documents />;
      case "news":
        return <NewsPage />;
      case "users":
        return <Users />;
      case "passwordManagement":
        return <PasswordManagement />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
