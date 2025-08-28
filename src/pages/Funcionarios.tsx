import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { PhotoCapture } from "../components/ui/PhotoCapture";
import { Funcionario, User, Department, Position } from "../types";
// import { useAuth } from '../contexts/AuthContext';
import { usePagination } from "../hooks/usePagination";
import {
  downloadPdfFromBlob,
  generateFuncionariosPDF,
} from "../utils/pdfGenerator";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../components/ui/Toast";
import { showConfirmation, showDeleteConfirmation } from "../utils/alerts";
import axios from "axios";

export const Funcionarios: React.FC = () => {
  // const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] =
    useState<Funcionario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [isPdfPreviewModalOpen, setIsPdfPreviewModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const [userFormData, setUserFormData] = useState<Partial<User>>({
    funcionario: "",
    email: "",
    role: "user",
    permissions: {
      canViewFuncionarios: false,
      canEditFuncionarios: false,
      canViewPositions: false,
      canEditPositions: false,
      canViewDepartments: false,
      canEditDepartments: false,
      canViewDocuments: false,
      canEditDocuments: false,
      canViewNews: false,
      canEditNews: false,
      canViewUsers: false,
      canEditUsers: false,
      canViewReports: false,
    },
    status: "Ativo",
  });

  const [formData, setFormData] = useState({
    name: "",
    funcionario: "",
    cpf: "",
    telefone: "",
    telefone2: "",
    razao_social: "",
    cnpj: "",
    tipo_contrato: "CLT",
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    uf: "",
    email: "",
    descricao: "",
    idCargo: "",
    cargo: "",
    idDepartamento: "",
    departamento: "",
    datanascimento: "",
    dataadmissao: "",
    datademissao: "",
    status: "Ativo",
    foto: "",
    fotoFile: null as File | null,
    id_office: "",
  });

  // Nova função para gerar e abrir o preview
  const handleGeneratePDFPreview = async () => {
    try {
      showInfoToast("Gerando relatório PDF...");
      const pdfBlob = await generateFuncionariosPDF(filteredFuncionarios);
      const url = URL.createObjectURL(pdfBlob);
      setPdfBlob(pdfBlob);
      setPdfUrl(url);
      setIsPdfPreviewModalOpen(true);
    } catch (error) {
      showErrorToast("Erro ao gerar o relatório PDF.");
      console.error(error);
    }
  };

  // Função para fechar o preview
  const closePdfPreviewModal = () => {
    setIsPdfPreviewModalOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl); // Importante para liberar memória
      setPdfUrl(null);
      setPdfBlob(null);
    }
  };

  // Função para baixar o PDF
  const handleDownloadPdf = () => {
    if (pdfBlob) {
      downloadPdfFromBlob(pdfBlob, "relatorio-colaboradores");
      showSuccessToast("Download iniciado!");
    }
    closePdfPreviewModal();
  };

  // Função para buscar funcionários
  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/funcionarios`
        );
        const data = response.data;

        if (Array.isArray(data)) {
          setFuncionarios(data);
        } else {
          console.error("Resposta inesperada da API:", data);
          showErrorToast("Dados inválidos recebidos do servidor.");
          setFuncionarios([]);
        }
      } catch (error) {
        showErrorToast("Erro ao carregar funcionários");
        console.error("Erro ao buscar funcionários:", error);
        setFuncionarios([]);
      }
    };
    fetchFuncionarios();
  }, []);

  // Função para buscar cargos e departamentos
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/cargos`
        );

        setPositions(response.data);
      } catch (error) {
        showErrorToast("Erro ao carregar cargos");
        console.error(error);
      }
    };

    // Função para buscar departamentos
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/departamentos`
        );
        setDepartments(response.data);
      } catch (error) {
        showErrorToast("Erro ao carregar departamentos");
        console.error(error);
      }
    };

    fetchPositions();
    fetchDepartments();
  }, []);

  // Função para buscar funcionários
  const fetchFuncionarios = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/funcionarios`
      );
      const data = response.data;

      if (Array.isArray(data)) {
        setFuncionarios(data);
      } else {
        console.error("Resposta inesperada da API:", data);
        showErrorToast("Dados inválidos recebidos do servidor.");
        setFuncionarios([]);
      }
    } catch (error) {
      showErrorToast("Erro ao carregar funcionários");
      console.error("Erro ao buscar funcionários:", error);
      setFuncionarios([]);
    }
  };

  // Função para buscar cargos
  const getPositionName = (cargo: string) => {
    // Primeiro tenta buscar pelo cargo_365, depois pelo id_cargo
    if (cargo) {
      return cargo; // Se tem cargo_365, usa ele diretamente
    }

    // Se não tem cargo_365, tenta buscar pelo id_cargo na lista de positions
    const position = positions.find(
      (p) => String(p.id_cargo) === String(cargo)
    );
    return position?.cargo || "Cargo não encontrado";
  };

  // Função para buscar departamentos
  const getDepartmentName = (departamento: string) => {
    // Primeiro tenta buscar pelo departamento_365, depois pelo id_departamento
    if (departamento) {
      return departamento; // Se tem departamento_365, usa ele diretamente
    }

    // Se não tem departamento_365, tenta buscar pelo id_departamento na lista de departments
    const department = departments.find(
      (d) => String(d.id_departamento) === String(departamento)
    );
    return department?.departamento || "Departamento não encontrado";
  };

  // Função para filtar os funcionários com base na pesquisa
  const filteredFuncionarios = funcionarios.filter(
    (funcionario) =>
      (funcionario.funcionario?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) || // nome
      (funcionario.razao_social?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) || // razão social
      // Usa cargo_365 se existir, senão busca pelo id_cargo
      (funcionario.cargo_365 || getPositionName(funcionario.cargo || ""))
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || // cargo
      // Usa departamento_365 se existir, senão busca pelo id_departamento
      (
        funcionario.departamento_365 ||
        getDepartmentName(funcionario.departamento || "")
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) // departamento
  );

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedFuncionarios,
    setCurrentPage,
    itemsPerPage,
    totalItems,
  } = usePagination({ data: filteredFuncionarios, itemsPerPage: 6 });

  // Função para abrir o modal
  const openModal = (
    mode: "view" | "edit" | "create",
    funcionario?: Funcionario
  ) => {
    setModalMode(mode);
    if (funcionario) {
      setSelectedFuncionario(funcionario);
      setFormData({
        name: funcionario.name || "",
        funcionario: funcionario.funcionario || "",
        cpf: funcionario.cpf || "",
        telefone: funcionario.telefone || "",
        telefone2: funcionario.telefone_2 || funcionario.telefone_2 || "",
        razao_social: funcionario.razao_social || "",
        cnpj: funcionario.cnpj || "",
        tipo_contrato: funcionario.tipo_contrato || "CLT",
        cep: funcionario.cep || "",
        endereco: funcionario.endereco || "",
        bairro: funcionario.bairro || "",
        cidade: funcionario.cidade || "",
        uf: funcionario.uf || "",
        email: funcionario.email || "",
        descricao: funcionario.descricao || "",
        idCargo: funcionario.id_cargo || "",
        cargo: funcionario.cargo_365 || "",
        idDepartamento: funcionario.id_departamento || "",
        departamento: funcionario.departamento_365 || "",
        datanascimento: funcionario.data_nascimento
          ? new Date(funcionario.data_nascimento).toISOString().split("T")[0]
          : "",
        dataadmissao: funcionario.data_admissao
          ? new Date(funcionario.data_admissao).toISOString().split("T")[0]
          : "",
        datademissao: funcionario.data_demissao
          ? new Date(funcionario.data_demissao).toISOString().split("T")[0]
          : "",
        status: funcionario.status || "Ativo",
        foto: funcionario.foto || "",
        fotoFile: null,
        id_office: funcionario.id,
      });
    } else {
      setSelectedFuncionario(null);
      setFormData({
        name: "",
        funcionario: "",
        cpf: "",
        telefone: "",
        telefone2: "",
        razao_social: "",
        cnpj: "",
        tipo_contrato: "CLT",
        cep: "",
        endereco: "",
        bairro: "",
        cidade: "",
        uf: "",
        email: "",
        descricao: "",
        idCargo: "",
        cargo: "",
        idDepartamento: "",
        departamento: "",
        datanascimento: "",
        dataadmissao: "",
        datademissao: "",
        status: "Ativo",
        foto: "",
        fotoFile: null,
        id_office: "",
      });
    }
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFuncionario(null);
  };

  // Função para abrir o modal de criação de usuário
  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setUserFormData({
      funcionario: "",
      email: "",
      role: "user",
      permissions: {
        canViewFuncionarios: false,
        canEditFuncionarios: false,
        canViewPositions: false,
        canEditPositions: false,
        canViewDepartments: false,
        canEditDepartments: false,
        canViewDocuments: false,
        canEditDocuments: false,
        canViewNews: false,
        canEditNews: false,
        canViewUsers: false,
        canEditUsers: false,
        canViewReports: false,
      },
      status: "Ativo",
    });
  };

  // Função para lidar com a criação de usuário
  const handleSaveUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/funcionarios/criaUsuario`,
        {
          // username: userFormData.username,
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          permissions: JSON.stringify(userFormData.permissions),
        }
      );

      closeUserModal();

      if (response.data.success) {
        showSuccessToast(`Usuário ${userFormData.name} criado com sucesso!`);
      } else {
        showErrorToast("Erro ao criar usuário.");
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      showErrorToast("Erro ao criar usuário.");
    } finally {
      closeUserModal();
    }
  };

  // Função criar e editar um funcionario
  const handleSave = async () => {
    // Crie um novo FormData
    const data = new FormData();

    // Adicione todos os campos de texto
    data.append("funcionario", formData.funcionario);
    data.append("cpf", formData.cpf);
    data.append("telefone", formData.telefone);
    data.append("telefone2", formData.telefone2);
    data.append("razao_social", formData.razao_social);
    data.append("cnpj", formData.cnpj);
    data.append("tipo_contrato", formData.tipo_contrato);
    data.append("cep", formData.cep);
    data.append("endereco", formData.endereco);
    data.append("bairro", formData.bairro);
    data.append("cidade", formData.cidade);
    data.append("uf", formData.uf);
    data.append("email", formData.email);
    data.append("descricao", formData.descricao);
    // As próximas duas linhas de idCargo e idDepartamento são redundantes e podem ser simplificadas
    data.append(
      "idCargo",
      formData.idCargo && !isNaN(+formData.idCargo) ? formData.idCargo : ""
    );
    data.append(
      "idDepartamento",
      formData.idDepartamento && !isNaN(+formData.idDepartamento)
        ? formData.idDepartamento
        : ""
    );
    data.append("cargo", formData.cargo || "");
    data.append("departamento", formData.departamento || "");
    data.append(
      "datanascimento",
      formData.datanascimento
        ? new Date(formData.datanascimento).toISOString()
        : ""
    );
    data.append(
      "dataadmissao",
      formData.dataadmissao ? new Date(formData.dataadmissao).toISOString() : ""
    );
    data.append(
      "datademissao",
      formData.datademissao ? new Date(formData.datademissao).toISOString() : ""
    );
    data.append("status", formData.status === "Ativo" ? "1" : "0");
    data.append("id_office", formData.id_office || "");

    // 1. Se uma nova foto foi selecionada/capturada, anexe o arquivo
    if (formData.fotoFile) {
      data.append("foto", formData.fotoFile, formData.fotoFile.name);
    }
    // 2. Se não há arquivo, mas há uma string Base64 no estado (de uma busca do Office 365) e estamos em modo de criação OU edição
    else if (
      formData.foto &&
      (modalMode === "create" || modalMode === "edit")
    ) {
      data.append("fotoBase64", formData.foto);
    }

    try {
      if (modalMode === "create") {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/funcionarios`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // ✅ VERIFICAÇÃO MELHORADA DE ERRO
        if (response.data.error) {
          showErrorToast(response.data.message || "Email já cadastrado!");
          return;
        }

        await fetchFuncionarios();
        showSuccessToast(
          `Colaborador ${formData.funcionario} cadastrado com sucesso!`
        );

        const confirmed = await showConfirmation(
          "Criar usuário?",
          `Deseja criar um usuário para que ${formData.funcionario} tenha acesso ao sistema?`,
          "Sim, criar usuário",
          "Não, obrigado"
        );

        if (confirmed) {
          setUserFormData({
            ...userFormData,
            funcionario: formData.funcionario,
            name: formData.funcionario,
            email: formData.email || "",
            // username: formData.email || '',
          });
          setIsUserModalOpen(true);
        }

        closeModal();
        return;
      } else if (modalMode === "edit" && selectedFuncionario) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/funcionarios/${
            selectedFuncionario.id_funcionario
          }`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // ✅ VERIFICAÇÃO DE ERRO PARA EDIÇÃO
        if (response.data.error) {
          showErrorToast(
            response.data.message || "Erro ao atualizar funcionário!"
          );
          return;
        }

        await fetchFuncionarios();
        showSuccessToast("Funcionário atualizado com sucesso!");
      }
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      showErrorToast("Erro ao salvar funcionário");
    }

    closeModal();
  };

  // Função para excluir um funcionário
  const handleDelete = async (id: string) => {
    // const funcionario = funcionarios.find(emp => emp.id === id);
    const confirmed = await showDeleteConfirmation(
      "Excluir funcionário?",
      `Tem certeza que deseja excluir esse registro? Esta ação não pode ser desfeita.`,
      "Sim, excluir"
    );

    if (confirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/funcionarios/${id}`
        );
        await fetchFuncionarios(); // Recarrega lista do backend
        showSuccessToast("Funcionário excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        showErrorToast("Erro ao excluir funcionário");
      }
    }
  };

  // Função para lidar com o envio do formulário de upload de foto
  const handlePhotoChange = (file: File | null, photoUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      foto: photoUrl || "",
      fotoFile: file,
    }));
  };

  // Função para verificar se o endereço completo foi preenchido
  const isAddressComplete = () => {
    return (
      formData.cep &&
      formData.endereco &&
      formData.bairro &&
      formData.cidade &&
      formData.uf
    );
  };

  // Função para abrir o Google Maps com o endereço completo
  const openGoogleMaps = () => {
    if (!isAddressComplete()) {
      showErrorToast(
        "Preencha todos os campos de endereço para visualizar no mapa"
      );
      return;
    }

    const fullAddress = `${formData.endereco}, ${formData.bairro}, ${formData.cidade} - ${formData.uf}, ${formData.cep}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    window.open(googleMapsUrl, "_blank");
    showInfoToast("Abrindo localização no Google Maps...");
  };

  // FUNCAO QUE BUSCA INFORMAÇOES DO FUNCIONARIO PELO OFFICE 365
  async function buscarFuncionario(email: string) {
    try {
      // const res = await fetch(`/api/usuarios?email=${email}`);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios?email=${email}`
      );
      const dados = await res.json();

      // Exemplo de extração dos campos
      const nomeCompleto = dados.displayName;
      const telefone = dados.mobilePhone;
      const cargo = dados.jobTitle;
      const departamento = dados.department;
      const id = dados.id;
      const foto = dados.photo;

      // Encontra o ID do cargo correspondente
      const cargoCorrespondente = positions.find(
        (p) => p.cargo.toLowerCase() === cargo?.toLowerCase()
      );

      // Encontra o ID do departamento correspondente
      const departamentoCorrespondente = departments.find(
        (d) => d.departamento.toLowerCase() === departamento?.toLowerCase()
      );

      setFormData((prev) => ({
        ...prev,
        funcionario: nomeCompleto || "",
        telefone: telefone ? telefone : prev.telefone,
        cargo: cargo || "",
        departamento: departamento || "",
        idCargo: cargoCorrespondente
          ? cargoCorrespondente.id_cargo.toString()
          : "",
        idDepartamento: departamentoCorrespondente
          ? departamentoCorrespondente.id_departamento.toString()
          : "",
        id_office: id || "",
        foto: foto || prev.foto,
      }));
    } catch (error) {
      console.error("Erro ao buscar funcionário no Office365:", error);
      showErrorToast("Erro ao buscar dados do Office365", 1500);
    }
  }

  //FUNCAO PARA BUSCAR ENDEREÇO PELO CEP
  const viaCep = async () => {
    const cep = formData.cep;
    const cepSemHifen = cep.replace("-", "");

    if (cepSemHifen.length === 8) {
      try {
        const resposta = await axios.get(
          `https://viacep.com.br/ws/${cepSemHifen}/json/`
        );

        // Exemplo: preencher automaticamente o formData
        setFormData((prev) => ({
          ...prev,
          endereco: resposta.data.logradouro || "",
          bairro: resposta.data.bairro || "",
          cidade: resposta.data.localidade || "",
          uf: resposta.data.uf || "",
        }));
      } catch (erro) {
        console.error("Erro ao buscar o CEP:", erro);
      }
    }
  };

  useEffect(() => {
    viaCep();
  }, [formData.cep]);

  //MASCARA TELEFONE
  function mascaraTelefone(valor: string) {
    if (valor.length > 15) {
      valor = "";
    }
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, "");

    // Aplica máscara de telefone (celular com DDD): (99) 99999-9999
    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
    }

    return valor;
  }

  //MASCARA CPF
  function mascaraCpf(valor: string) {
    if (valor.length > 14) {
      valor = "";
    }
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, "");

    // Aplica a máscara: 000.000.000-00
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    return valor;
  }

  //MASCARA CEP
  function mascaraCep(valor: string) {
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, "");

    const cincoPrimeiros = valor.substring(0, 5);
    const tresUltimos = valor.substring(5, 8);

    if (valor.length <= 5) {
      return cincoPrimeiros;
    }

    return `${cincoPrimeiros}-${tresUltimos}`;
  }

  //MASCARA uf
  function mascaraUf(valor: string) {
    // Remove tudo que não for letra
    valor = valor.replace(/[^a-zA-Z]/g, "");

    // Converte para maiúsculas
    valor = valor.toUpperCase();

    // Limita a 2 caracteres
    return valor.substring(0, 2);
  }

  //MASCARA CNPJ
  function mascaraCnpj(valor: string) {
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, "");

    // Limita a 14 dígitos
    valor = valor.slice(0, 14);

    // Aplica a máscara: 00.000.000/0000-00
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");

    return valor;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* <h2 className="text-2xl font-bold text-white">Colaboradores</h2> */}
          <p className="text-2xl text-gray-300">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* <Button variant="secondary" icon={FileText} onClick={generatePDF}>
            Relatório PDF
          </Button> */}
          <Button
            variant="secondary"
            icon={FileText}
            onClick={handleGeneratePDFPreview}
          >
            Visualizar Relatório
          </Button>
          <Button icon={Plus} onClick={() => openModal("create")}>
            Novo Colaborador
          </Button>
        </div>
      </div>

      {/* Filtros para buscar colaboradores por nome e outros... */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
            {/* <div className="flex flex-col h-10 px-4 text-sm sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button variant="orange" icon={Filter} className="flex flex-col sm:flex-row gap-2">
                Filtros
              </Button>
            </div> */}
          </div>
        </div>
      </Card>

      {/* Lista de Funcionarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedFuncionarios.map((funcionario) => (
          <Card key={funcionario.id_funcionario}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  {funcionario.foto ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${
                        funcionario.foto
                      }`}
                      alt={funcionario.funcionario || "Funcionário"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {funcionario.funcionario &&
                      funcionario.funcionario.length > 0
                        ? funcionario.funcionario.charAt(0)
                        : ""}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {funcionario.funcionario}
                  </h3>
                  <p
                    className={`text-sm ${
                      !funcionario.cargo_365
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {funcionario.cargo_365 || "Cargo não aplicado"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {funcionario.departamento_365}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-blue-800">
                  {funcionario.razao_social}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      funcionario.tipo_contrato === "CLT"
                        ? "bg-blue-100 text-blue-800"
                        : funcionario.tipo_contrato === "PJ"
                        ? "bg-green-100 text-green-800"
                        : funcionario.tipo_contrato === "EST"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800" // fallback se nenhum dos 3
                    }`}
                  >
                    {funcionario.tipo_contrato}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      funcionario.status == "Ativo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {funcionario.status == "Ativo" ? "Ativo" : "Inativo"}
                  </span>
                  {/* <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    funcionario.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {funcionario.status ? 'Ativo' : 'Inativo'}
                  </span> */}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="blue"
                    onClick={() => openModal("view", funcionario)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openModal("edit", funcionario)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(funcionario.id_funcionario)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fixed Bottom Pagination */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      </div>

      {/* Modal de Criação de Funcionário */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Novo Colaborador"
            : modalMode === "edit"
            ? "Editar Colaborador"
            : "Visualizar Colaborador"
        }
        size="2xl"
      >
        <div className="space-y-4">
          <PhotoCapture
            currentPhoto={formData.foto}
            onPhotoChange={handlePhotoChange}
            className="mb-6"
            disabled={modalMode === "view"}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo da ficha */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ficha
              </label>
              <select
                value={formData.tipo_contrato}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo_contrato: e.target.value as "CLT" | "PJ" | "EST",
                  })
                }
                disabled={modalMode === "view"}
                className="w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="EST">ESTÁGIO</option>
              </select>
            </div>
            <div className="flex items-center mb-4">
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={formData.status === "Ativo"}
                  onChange={() => setFormData({ ...formData, status: "Ativo" })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Ativo</span>
              </label>

              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={formData.status === "Inativo"}
                  onChange={() =>
                    setFormData({ ...formData, status: "Inativo" })
                  }
                  className="h-4 w-4 ml-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Inativo</span>
              </label>
            </div>

            {/* Email e Telefone */}
            <div className="md:col-span-2">
              <div className="flex gap-2 items-start">
                {/* Email */}
                <div className="flex-1">
                  <Input
                    label="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={modalMode === "view"}
                  />
                </div>

                {/* Botão da lupa com label simulado */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-[6px]">
                    &nbsp;
                  </label>
                  <button
                    type="button"
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                    title="Buscar email"
                    onClick={() => buscarFuncionario(formData.email)}
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Telefone */}
                <div className="w-[150px]">
                  <Input
                    label="Telefone"
                    value={formData.telefone}
                    // onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefone: mascaraTelefone(e.target.value),
                      })
                    }
                    disabled={modalMode === "view"}
                    placeholder="(11) 90000-0000"
                  />
                </div>
                <div className="w-[150px]">
                  <Input
                    label="Telefone 2"
                    value={formData.telefone2}
                    // onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefone2: mascaraTelefone(e.target.value),
                      })
                    }
                    disabled={modalMode === "view"}
                    placeholder="(11) 90000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Nome e Cpf */}
            <div className="md:col-span-2">
              <div className="flex gap-4 items-end">
                {/* Nome */}
                <div className="flex-1">
                  <Input
                    label="Colaborador"
                    value={formData.funcionario}
                    onChange={(e) =>
                      setFormData({ ...formData, funcionario: e.target.value })
                    }
                    disabled={modalMode === "view"}
                  />
                </div>

                {/* Cpf */}
                <div className="w-[140px]">
                  <Input
                    label="CPF"
                    value={formData.cpf}
                    // onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpf: mascaraCpf(e.target.value),
                      })
                    }
                    disabled={modalMode === "view"}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>

            {formData.tipo_contrato === "PJ" && (
              <div className="md:col-span-2">
                <div className="flex gap-4 items-end">
                  {/* Nome */}
                  <div className="flex-1">
                    <Input
                      label="Razão Social"
                      value={formData.razao_social}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          razao_social: e.target.value,
                        })
                      }
                      disabled={modalMode === "view"}
                    />
                  </div>

                  {/* Cnpj */}
                  <div className="w-[170px]">
                    <Input
                      label="CNPJ"
                      value={formData.cnpj}
                      // onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cnpj: mascaraCnpj(e.target.value),
                        })
                      }
                      disabled={modalMode === "view"}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <div className="flex gap-4 items-end">
                <div>
                  <Input
                    label="CEP"
                    value={formData.cep}
                    // onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cep: mascaraCep(e.target.value),
                      })
                    }
                    disabled={modalMode === "view"}
                    maxLength={9}
                    className="w-[110px]"
                    placeholder="00000-000"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Endereço"
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco: e.target.value })
                    }
                    disabled={modalMode === "view"}
                    className="w-full" // ou remova essa linha
                  />
                </div>
              </div>
            </div>

            {/* Bairro, Cidade, UF e Mapa */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Bairro"
                    value={formData.bairro}
                    onChange={(e) =>
                      setFormData({ ...formData, bairro: e.target.value })
                    }
                    disabled={modalMode === "view"}
                  />
                </div>
              </div>

              {/* Cidade, UF e Botão do Mapa */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Cidade"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                    disabled={modalMode === "view"}
                  />
                </div>
                <div className="flex gap-4 items-end">
                  {/* Input UF e botão lado a lado */}
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <Input
                        label="UF"
                        value={formData.uf}
                        // onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            uf: mascaraUf(e.target.value),
                          })
                        }
                        disabled={modalMode === "view"}
                        maxLength={2}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!isAddressComplete()}
                      onClick={openGoogleMaps}
                      title="Ver no Google Maps"
                      className="h-10 w-10 text-lg" // altura e largura maiores, texto maior também
                    >
                      🗺️
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo */}
            {/* <select
              value={formData.idCargo || ""}
              onChange={(e) =>
                setFormData({ ...formData, idCargo: e.target.value })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um cargo</option>
              {positions.map((position) => (
                <option key={position.id_cargo} value={position.cargo}>
                  {position.cargo}
                </option>
              ))}
            </select> */}
            <div className="flex-1">
              <Input
                label="Cargo"
                value={formData.cargo}
                onChange={(e) =>
                  setFormData({ ...formData, cargo: e.target.value })
                }
                disabled={modalMode === "view"}
              />
            </div>

            {/* Departamento */}
            {/* <select
              value={formData.idDepartamento || ""}
              onChange={(e) =>
                setFormData({ ...formData, idDepartamento: e.target.value })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um departamento</option>
              {departments.map((department) => (
                <option
                  key={department.id_departamento}
                  value={department.id_departamento}
                >
                  {department.departamento}
                </option>
              ))}
            </select> */}

            <div className="flex-1">
              <Input
                label="Departamento"
                value={formData.departamento}
                onChange={(e) =>
                  setFormData({ ...formData, departamento: e.target.value })
                }
                disabled={modalMode === "view"}
              />
            </div>
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.datanascimento}
              onChange={(e) =>
                setFormData({ ...formData, datanascimento: e.target.value })
              }
              disabled={modalMode === "view"}
            />
            {formData.status == "Ativo" ? (
              <Input
                label="Data de Admissão"
                type="date"
                value={formData.dataadmissao}
                onChange={(e) =>
                  setFormData({ ...formData, dataadmissao: e.target.value })
                }
                disabled={modalMode === "view"}
              />
            ) : (
              <Input
                label="Data de Demissão"
                type="date"
                value={formData.datademissao}
                onChange={(e) =>
                  setFormData({ ...formData, datademissao: e.target.value })
                }
                disabled={modalMode === "view"}
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              disabled={modalMode === "view"}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {modalMode !== "view" && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button onClick={handleSave}>
                {modalMode === "create" ? "Incluir" : "Alterar"}
              </Button>
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Criação de Usuário */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        title="Criar Usuário para Funcionário"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Informações do Usuário
            </h4>
            <p className="text-sm text-blue-700">
              Configure as informações de acesso e permissões para este
              colaborador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={userFormData.name}
              onChange={(e) =>
                setUserFormData({ ...userFormData, name: e.target.value })
              }
              disabled
            />

            <Input
              label="Email"
              type="email"
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Acesso
            </label>
            <select
              value={userFormData.role}
              onChange={(e) =>
                setUserFormData({
                  ...userFormData,
                  role: e.target.value as "admin" | "user",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Permissões do Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Funcionários</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canViewFuncionarios"
                      checked={userFormData.permissions?.canViewFuncionarios}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canViewFuncionarios",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canViewFuncionarios"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Visualizar
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEditFuncionarios"
                      checked={userFormData.permissions?.canEditFuncionarios}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canEditFuncionarios",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canEditFuncionarios"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Editar
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Cargos</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canViewPositions"
                      checked={userFormData.permissions?.canViewPositions}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canViewPositions",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canViewPositions"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Visualizar
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEditPositions"
                      checked={userFormData.permissions?.canEditPositions}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canEditPositions",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canEditPositions"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Editar
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Departamentos</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canViewDepartments"
                      checked={userFormData.permissions?.canViewDepartments}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canViewDepartments",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canViewDepartments"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Visualizar
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEditDepartments"
                      checked={userFormData.permissions?.canEditDepartments}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canEditDepartments",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canEditDepartments"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Editar
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Documentos</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canViewDocuments"
                      checked={userFormData.permissions?.canViewDocuments}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canViewDocuments",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canViewDocuments"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Visualizar
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEditDocuments"
                      checked={userFormData.permissions?.canEditDocuments}
                      onChange={(e) =>
                        handlePermissionChange(
                          "canEditDocuments",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canEditDocuments"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Editar
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Notícias</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canViewNews"
                      checked={userFormData.permissions?.canViewNews}
                      onChange={(e) =>
                        handlePermissionChange("canViewNews", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canViewNews"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Visualizar
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEditNews"
                      checked={userFormData.permissions?.canEditNews}
                      onChange={(e) =>
                        handlePermissionChange("canEditNews", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canEditNews"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Editar
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Usuários</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canViewUsers"
                      checked={userFormData.permissions?.canViewUsers}
                      onChange={(e) =>
                        handlePermissionChange("canViewUsers", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canViewUsers"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Visualizar
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEditUsers"
                      checked={userFormData.permissions?.canEditUsers}
                      onChange={(e) =>
                        handlePermissionChange("canEditUsers", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canEditUsers"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Editar
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="userIsActive"
              checked={userFormData.status === "Ativo"}
              onChange={(e) =>
                setUserFormData({
                  ...userFormData,
                  status: e.target.checked ? "Ativo" : "Inativo",
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="userIsActive"
              className="ml-2 block text-sm text-gray-700"
            >
              Usuário Ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeUserModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>Criar Usuário</Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Pré-visualização do Relatório */}
      <Modal
        isOpen={isPdfPreviewModalOpen}
        onClose={closePdfPreviewModal}
        title="Pré-visualização do Relatório"
        size="2xl"
      >
        <div className="flex flex-col h-[70vh]">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="flex-grow border-0 rounded-lg" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Carregando pré-visualização...
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={closePdfPreviewModal}>
            Fechar
          </Button>
          <Button onClick={handleDownloadPdf}>Baixar PDF</Button>
        </div>
      </Modal>
    </div>
  );
};
