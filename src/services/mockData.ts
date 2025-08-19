import { Funcionario, Position, Department, DashboardStats } from '../types';
import { Document, News } from '../types';

export const mockPositions: Position[] = [
  {
    id: '1',
    name: 'Desenvolvedor Frontend',
    description: 'Desenvolvimento de interfaces web',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Analista de Sistemas',
    description: 'Análise e desenvolvimento de sistemas',
    isActive: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Gerente de Projeto',
    description: 'Gestão de projetos e equipes',
    isActive: true,
    createdAt: new Date('2024-01-20')
  }
];

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Tecnologia da Informação',
    description: 'Departamento de TI',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Recursos Humanos',
    description: 'Departamento de RH',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Financeiro',
    description: 'Departamento Financeiro',
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

export const mockEmployees: Funcionario[] = [];

export const getDashboardStats = (): DashboardStats => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const birthdaysToday = mockEmployees.filter(emp => {
    const birthDate = new Date(emp.data_nascimento);
    return birthDate.getMonth() === currentMonth && birthDate.getDate() === currentDay;
  });

  const birthdaysThisMonth = mockEmployees.filter(emp => {
    const birthDate = new Date(emp.data_nascimento);
    return birthDate.getMonth() === currentMonth;
  });

  return {
    totalEmployees: mockEmployees.filter(emp => emp.status).length,
    totalPositions: mockPositions.filter(pos => pos.isActive).length,
    totalDepartments: mockDepartments.filter(dept => dept.isActive).length,
    totalDocuments: mockDocuments.filter(doc => doc.isActive).length,
    totalNews: mockNews.filter(news => news.status).length,
    birthdaysToday,
    birthdaysThisMonth
  };
};

export const mockDocuments: Document[] = [];

export const mockNews: News[] = [];