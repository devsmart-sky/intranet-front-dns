import Swal from 'sweetalert2';

// Configurações padrão do SweetAlert
const defaultConfig = {
  customClass: {
    popup: 'rounded-lg',
    title: 'text-lg font-semibold text-gray-900',
    content: 'text-sm text-gray-600',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mr-2',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg',
  },
  buttonsStyling: false,
};

// Confirmação de exclusão
export const showDeleteConfirmation = async (
  title: string = 'Tem certeza?',
  text: string = 'Esta ação não pode ser desfeita!',
  confirmButtonText: string = 'Sim, excluir!'
): Promise<boolean> => {
  const result = await Swal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    customClass: {
      ...defaultConfig.customClass,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg mr-2',
    },
  });

  return result.isConfirmed;
};

// Confirmação genérica
export const showConfirmation = async (
  title: string,
  text: string,
  confirmButtonText: string = 'Confirmar',
  cancelButtonText: string = 'Cancelar'
): Promise<boolean> => {
  const result = await Swal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed;
};

// Alerta de sucesso
export const showSuccessAlert = (
  title: string = 'Sucesso!',
  text: string = 'Operação realizada com sucesso!'
) => {
  Swal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
  });
};

// Alerta de erro
export const showErrorAlert = (
  title: string = 'Erro!',
  text: string = 'Ocorreu um erro inesperado!'
) => {
  Swal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    customClass: {
      ...defaultConfig.customClass,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg',
    },
  });
};

// Alerta de informação
export const showInfoAlert = (
  title: string,
  text: string,
  confirmButtonText: string = 'OK'
) => {
  Swal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'info',
    confirmButtonText,
  });
};

// Input personalizado
export const showInputDialog = async (
  title: string,
  inputPlaceholder: string = '',
  inputValue: string = ''
): Promise<string | null> => {
  const result = await Swal.fire({
    ...defaultConfig,
    title,
    input: 'text',
    inputPlaceholder,
    inputValue,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Você precisa digitar algo!';
      }
    },
  });

  return result.isConfirmed ? result.value : null;
};

export default Swal;