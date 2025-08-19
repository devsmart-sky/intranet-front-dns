import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SSOCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithUserData } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processSSO = async () => {
      try {
        setStatus('processing');

        // Verificar se há erro nos parâmetros
        const errorParam = searchParams.get('error');
        if (errorParam) {
          let errorMessage = 'Erro no login SSO';
          
          switch (errorParam) {
            case 'user_not_found':
              errorMessage = 'Usuário não encontrado no sistema. Entre em contato com o administrador.';
              break;
            case 'login_failed':
              errorMessage = 'Falha na autenticação. Tente novamente.';
              break;
            case 'sso_processing_failed':
              errorMessage = 'Erro ao processar login SSO.';
              break;
            default:
              errorMessage = `Erro: ${errorParam}`;
          }
          
          setErrorMessage(errorMessage);
          setStatus('error');
          
          // Redirecionar para login após 5 segundos
          setTimeout(() => {
            navigate('intranet/login', { replace: true });
          }, 5000);
          return;
        }

        // Verificar se há dados do usuário
        const userParam = searchParams.get('user');
        if (userParam) {
          try {
            // Decodificar os dados do usuário
            const userData = JSON.parse(decodeURIComponent(userParam));
            console.log('Dados do usuário recebidos:', userData);
            
            // Verificar se tem token
            if (userData.token) {
              // Salvar o token no localStorage
              localStorage.setItem('token', userData.token);
              
              // Remover o token dos dados do usuário antes de passar para o contexto
              const { token, ...userInfo } = userData;
              
              // Fazer login usando os dados recebidos
              await loginWithUserData(userInfo);
              
              setStatus('success');
              
              // Redirecionar para o dashboard após um breve delay
              setTimeout(() => {
                navigate('intranet/dashboard', { replace: true });
              }, 1000);
              
            } else {
              throw new Error('Token não encontrado nos dados do usuário');
            }
            
          } catch (parseError) {
            console.error('Erro ao processar dados do usuário:', parseError);
            setErrorMessage('Erro ao processar dados de autenticação');
            setStatus('error');
            
            setTimeout(() => {
              navigate('intranet/login', { replace: true });
            }, 3000);
          }
        } else {
          // Se chegou aqui sem parâmetros, verificar se é a primeira vez (redirecionamento do Azure)
          const code = searchParams.get('code');
          const state = searchParams.get('state');
          
          if (code && state) {
            // Há código de autorização, mas estamos no frontend - redirecionar para o backend processar
            console.log('Redirecionando para o backend processar o código...');
            window.location.href = `${window.location.origin}/api/office365/redirect${window.location.search}`;
            return;
          }
          
          // Se não há dados nem código, redirecionar para login
          setErrorMessage('Dados de autenticação não encontrados');
          setStatus('error');
          
          setTimeout(() => {
            navigate('intranet/login', { replace: true });
          }, 3000);
        }
        
      } catch (error) {
        console.error('Erro ao processar SSO:', error);
        setErrorMessage('Erro inesperado ao processar login');
        setStatus('error');
        
        setTimeout(() => {
          navigate('intranet/login', { replace: true });
        }, 3000);
      }
    };

    processSSO();
  }, [searchParams, navigate, loginWithUserData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md w-full">
        
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processando login...</h2>
            <p className="text-gray-600">Aguarde enquanto validamos suas credenciais</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Login realizado com sucesso!</h2>
            <p className="text-gray-600">Redirecionando para o sistema...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro na autenticação</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Você será redirecionado para a página de login...</p>
            
            <button 
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voltar ao Login
            </button>
          </>
        )}
        
      </div>
    </div>
  );
};