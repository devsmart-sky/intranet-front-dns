export interface User {
  id: string;
  id_funcionario?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  funcionario?: string;
  permissions: UserPermissions;
  status: string;
  criado: Date;
  photo?: File | null;
  photoFile?: File | null;
}

export interface UserPermissions {
  canViewFuncionarios: boolean;
  canEditFuncionarios: boolean;
  canViewPositions: boolean;
  canEditPositions: boolean;
  canViewOrganograma?: boolean;
  canEditOrganograma?: boolean;
  canViewDepartments: boolean;
  canEditDepartments: boolean;
  canViewDocuments: boolean;
  canEditDocuments: boolean;
  canViewNews: boolean;
  canEditNews: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canViewReports: boolean;
  canViewPasswordManagement: boolean;
  canEditPasswordManagement: boolean;
}

export interface Funcionario {
  id_funcionario: any;
  id_cargo: any;
  id_departamento: any;
  id: string;
  name: string;
  funcionario: string;
  email?: string;
  telefone?: string;
  telefone_2?: string;
  cpf: string;
  cnpj?: string;
  razao_social?: string; // Razão social para PJ
  foto?: string;
  tipo_contrato: 'CLT' | 'PJ';
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  descricao: string;
  cargo: string;
  cargo_365: string;
  departamento: string;
  departamento_365: string;
  data_nascimento: Date;
  data_admissao: Date;
  data_demissao: Date;
  status: string;
  criado: Date;
}

export interface Position {
  id_cargo: string;
  cargo: string;
  descricao: string;
  status: string;
  criado: Date;
}

export interface Department {
  id_departamento: string;
  departamento: string;
  descricao: string;
  status: boolean;
  criado: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
  photo?: string;
  status: string;
  office365: {
    displayName: string;
    jobTitle: string;
    department: string;
    mobilePhone: string;
    businessPhones: string;
  }
}

export interface LoginCredentials {
  email: string;
  username: string;
  loginType: string;
  password: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalPositions: number;
  totalDepartments: number;
  totalDocuments: number;
  totalNews: number;
  birthdaysToday: Funcionario[];
  birthdaysThisMonth: Funcionario[];
}

export interface Document {
  id_documento: string;
  nome: string;
  descricao: string;
  arquivo: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  categoria: string;
  nivel: 'Público' | 'Restrito' | 'Admin';
  allowedRoles?: ('admin' | 'user')[];
  allowedUsers?: string[];
  uploadedBy: string;
  criado: Date;
  isActive: boolean;
}

export interface News {
  id_noticias: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  url_imagem?: string;
  url_fonte?: string;
  nome_fonte?: string;
  categoria: string;
  author: string;
  publishedAt: Date;
  ativo: number;
  destaque: number;
  views: number;
  criado: Date;
  status: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  lastActivity: Date;
  isOnline: boolean;
}

export interface Colaboradores {
  id: string;
  displayName: string;
  jobTitle: string;
  mail: string;
  department: string;
  manager?: Colaboradores;
  directReports: Colaboradores[];
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

export interface OrgNode {
  id: string;
  name: string;
  title: string;
  email: string;
  department: string;
  manager?: string;
  children: OrgNode[];
  level: number;
  isExpanded: boolean;
}