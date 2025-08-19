import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Funcionario, Position, Department, User } from '../types';
import Logo from '../../public/vertical_pequeno_400w_colorido.png';

interface PDFOptions {
  title: string;
  data: any[];
  columns: { header: string; dataKey: string }[];
  filename: string;
}

// Função auxiliar para carregar imagens
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

// Função auxiliar para adicionar o cabeçalho
const addHeader = async (doc: jsPDF, pageWidth: number) => {
  try {
    const img = await loadImage(Logo);

    // Define uma largura alvo para o logo em mm.
    const logoTargetWidth = 55;
    
    // Calcula a altura correspondente para manter a proporção original do logo.
    const aspectRatio = img.height / img.width;
    const logoHeight = logoTargetWidth * aspectRatio;

    // Calcula a posição X para centralizar o logo.
    const logoX = (pageWidth - logoTargetWidth) / 2;
    
    // Define a posição Y (vertical) do logo no topo da página.
    const logoY = 4;

    // Adiciona a imagem com as novas coordenadas e dimensões.
    doc.addImage(img, 'PNG', logoX, logoY, logoTargetWidth, logoHeight);

  } catch (error) {
    console.error("Erro ao carregar o logo:", error);
  }
};

// Função auxiliar para adicionar o rodapé
const addFooter = (doc: jsPDF, pageNumber: number, totalPages: number, pageWidth: number) => {
  doc.setFontSize(10);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 40, doc.internal.pageSize.height - 10);
};

// Função para gerar o PDF como Blob
const generatePdfBlob = async ({ title, data, columns }: Omit<PDFOptions, 'filename'>): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  // const pageHeight = doc.internal.pageSize.height; // Removido pois não é usado diretamente

  const headerPromise = addHeader(doc, pageWidth);
  await headerPromise;

  // Adiciona o título do relatório no topo da página
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 40, { align: 'center' });

  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey])),
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 30 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        addHeader(doc, pageWidth);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, 30, { align: 'center' });
      }
      addFooter(doc, data.pageNumber, doc.internal.pages.length, pageWidth);
    },
  });

  return doc.output('blob');
};

// Função para fazer o download do PDF
export const downloadPdfFromBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Limpa a URL de objeto
};

// Função para geração de PDF para colaboradores
export const generateFuncionariosPDF = async (employees: Funcionario[]): Promise<Blob> => {
  return generatePdfBlob({
    title: 'Relatório de Colaboradores',
    data: employees,
    columns: [
      { header: 'Nome', dataKey: 'funcionario' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Tipo', dataKey: 'tipo_contrato' },
      { header: 'Ativo', dataKey: 'status' },
    ],
  });
};

// Função para geração de PDF para cargos
export const generatePositionsPDF = async (positions: Position[]) => {
  await generatePdfBlob({
    title: 'Relatório de Cargos',
    data: positions,
    columns: [
      { header: 'Nome', dataKey: 'cargo' },
      { header: 'Descrição', dataKey: 'descricao' },
      { header: 'Ativo', dataKey: 'status' },
    ],
  });
};

// Função para geração de PDF para departamentos
export const generateDepartmentsPDF = async (departments: Department[]) => {
  return generatePdfBlob({
    title: 'Relatório de Orgonograma',
    data: departments,
    columns: [
      { header: 'Nome', dataKey: 'departamento' },
      { header: 'Descrição', dataKey: 'descricao' },
      { header: 'Ativo', dataKey: 'status' },
    ],
  });
};

// Função para geração de PDF para usuários
export const generateUsersPDF = async (users: User[]) => {
  return generatePdfBlob({
    title: 'Relatório de Usuários',
    data: users,
    columns: [
      { header: 'Name', dataKey: 'name' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Role', dataKey: 'role' },
      { header: 'Status', dataKey: 'status' },
    ],
  });
};