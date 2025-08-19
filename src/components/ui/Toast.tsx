import toast, { Toaster } from 'react-hot-toast';

// Configurações padrão para os toasts
const defaultOptions = {
 duration: 4000, // Duração padrão de 4 segundos
 position: 'top-right' as const,
 style: {
  borderRadius: '8px',
  background: '#333',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '500',
  padding: '12px 16px',
  maxWidth: '400px',
 },
};

// Toast de sucesso
// Adicione um parâmetro 'customDuration' que é opcional
export const showSuccessToast = (message: string, customDuration?: number) => {
 toast.success(message, {
  ...defaultOptions,
  duration: customDuration !== undefined ? customDuration : defaultOptions.duration, // Use a duração personalizada se fornecida
  style: {
   ...defaultOptions.style,
   background: '#10b981',
  },
  iconTheme: {
   primary: '#fff',
   secondary: '#10b981',
  },
 });
};

// Toast de erro - Pode adicionar customDuration aqui também se quiser controle
export const showErrorToast = (message: string, customDuration?: number) => {
 toast.error(message, {
  ...defaultOptions,
    duration: customDuration !== undefined ? customDuration : defaultOptions.duration,
  style: {
   ...defaultOptions.style,
   background: '#ef4444',
  },
  iconTheme: {
   primary: '#fff',
   secondary: '#ef4444',
  },
 });
};

// Toast de informação - Pode adicionar customDuration aqui também
export const showInfoToast = (message: string, customDuration?: number) => {
 toast(message, {
  ...defaultOptions,
    duration: customDuration !== undefined ? customDuration : defaultOptions.duration,
  style: {
   ...defaultOptions.style,
   background: '#3b82f6',
  },
  icon: 'ℹ️',
 });
};

// Toast de aviso - Pode adicionar customDuration aqui também
export const showWarningToast = (message: string, customDuration?: number) => {
 toast(message, {
  ...defaultOptions,
    duration: customDuration !== undefined ? customDuration : defaultOptions.duration,
  style: {
   ...defaultOptions.style,
   background: '#f59e0b',
  },
  icon: '⚠️',
 });
};

// Toast personalizado (já aceita options, então a duração pode ser passada aqui)
export const showCustomToast = (message: string, options?: any) => {
 toast(message, {
  ...defaultOptions,
  ...options,
 });
};

// Componente Toaster para ser usado no App
export const ToastContainer = () => {
 return <Toaster position="top-right" reverseOrder={false} />;
};

export default toast;