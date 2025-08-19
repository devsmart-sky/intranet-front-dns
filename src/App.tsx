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
