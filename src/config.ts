export const API_BASE_URL = import.meta.env.PROD
  ? '/intranet/api'  // Em produção, usa o caminho relativo
  : '/api';          // Em desenvolvimento, usa o proxy