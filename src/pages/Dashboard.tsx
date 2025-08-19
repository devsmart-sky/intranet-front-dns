import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  Newspaper,
  UsersIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { BirthdayBanner } from "../components/BirthdayBanner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
// import { getDashboardStats } from "../services/mockData";
import type { Document, Funcionario, News } from "../types";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
// import { News } from '../types';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user, showBirthdayBanner, hideBirthdayBanner } = useAuth();
  // const stats = getDashboardStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [documentos, setDocumentos] = useState<Document[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [aniversariantesDoMes, setAniversariantesDoMes] = useState<
    Funcionario[]
  >([]);
  const [todosFuncionarios, setTodosFuncionarios] = useState<Funcionario[]>([]);
  const [feriados, setFeriados] = useState<{ date: string; name: string }[]>(
    []
  );
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Trazer os documentos do banco de dados
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/documento`
        );

        const docsComUrls = res.data.map((doc: Document) => ({
          ...doc,
          fileUrl: `${import.meta.env.VITE_API_URL}/docs/${doc.arquivo}`, // <- Aqui o caminho de download
        }));

        setDocumentos(docsComUrls);
      } catch (err) {
        console.error("Erro ao buscar documentos:", err);
      }
    };

    loadDocuments();
  }, []);

  // Trazer as notícias do banco de dados
  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/noticias`);
        setNews(res.data);
      } catch (err) {
        console.error("Erro ao buscar notícias:", err);
      }
    };

    loadNews();
  }, []);

  // Trazer todos os funcionários uma única vez
  useEffect(() => {
    const carregarFuncionarios = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/funcionarios`
        );
        setTodosFuncionarios(res.data);
      } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
      }
    };

    carregarFuncionarios();
  }, []);

  // Atualizar aniversariantes quando o mês do calendário mudar
  useEffect(() => {
    const mesCalendario = currentCalendarDate.getMonth();

    const aniversariantes = todosFuncionarios
      .filter((func) => {
        const dataNasc = new Date(func.data_nascimento);
        return dataNasc.getMonth() === mesCalendario;
      })
      .sort(
        (a, b) =>
          new Date(a.data_nascimento).getDate() -
          new Date(b.data_nascimento).getDate()
      );

    setAniversariantesDoMes(aniversariantes);
  }, [currentCalendarDate, todosFuncionarios]);

  // Trazer os feriados do ano atual uma única vez para o calendário
  useEffect(() => {
    const carregarFeriados = async () => {
      const anoAtual = currentCalendarDate.getFullYear();
      try {
        const res = await axios.get(
          `https://brasilapi.com.br/api/feriados/v1/${anoAtual}`
        );

        setFeriados(res.data);
      } catch (err) {
        console.error("Erro ao buscar feriados:", err);
      }
    };

    carregarFeriados();
  }, [currentCalendarDate.getFullYear()]);

  // Função para verificar se um documento foi postado nesta semana
  function postadoEstaSemana(dateStr: string | Date) {
    const today = new Date();
    const date = new Date(dateStr);

    const inicioDaSemana = new Date(today);
    inicioDaSemana.setDate(today.getDate() - today.getDay()); // Domingo

    const finalDaSemana = new Date(today);
    finalDaSemana.setDate(today.getDate() + (6 - today.getDay())); // Sábado

    return date >= inicioDaSemana && date <= finalDaSemana;
  }

  // Filtrar os documentos acessíveis
  const accessibleDocuments = documentos
    .filter((doc) => {
      // Verifica acesso
      const hasAccess =
        doc.nivel === "Público" ||
        (doc.nivel === "Restrito" && user?.role === "admin") ||
        (doc.nivel === "Admin" && user?.role === "admin");

      // Verifica se o documento foi postado nesta semana
      const recente = doc.criado ? postadoEstaSemana(doc.criado) : false;

      return hasAccess && recente;
    })
    .sort(
      (a, b) => new Date(a.criado).getTime() - new Date(b.criado).getTime()
    );

  // Trazer as notícias em ordem crescente
  const noticiasRecentes = news
    .sort((a, b) => new Date(a.criado).getTime() - new Date(b.criado).getTime())
    .slice(0, 5);

  // const recentNews = news.filter(news => news.ativo).slice(0, 5);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNewsClick = (news: News) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
  };

  // Função para baixar o documento
  const handleDocumentDownload = (document: any) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, "_blank"); // Abre a URL em uma nova aba
    }
  };

  // Funções para navegação do calendário
  const handlePreviousMonth = () => {
    setCurrentCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setSelectedDate(null); // Limpar data selecionada ao mudar de mês
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setSelectedDate(null); // Limpar data selecionada ao mudar de mês
  };

  const handleTodayClick = () => {
    setCurrentCalendarDate(new Date());
    setSelectedDate(null);
  };

  // Função para obter o icone de acesso
  const getAccessIcon = (nivel: string) => {
    switch (nivel) {
      case "Público":
        return <Globe className="w-4 h-4 text-green-600" />;
      case "Restrito":
        return <UsersIcon className="w-4 h-4 text-yellow-600" />;
      case "Admin":
        return <Lock className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-green-600" />;
    }
  };

  // Função para obter o label de acesso
  const getAccessLabel = (nivel: string) => {
    switch (nivel) {
      case "Público":
        return "Público";
      case "Restrito":
        return "Restrito";
      case "Admin":
        return "Administradores";
      default:
        return "Público";
    }
  };

  // Função para gerar o calendário
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = currentCalendarDate.getMonth();
    const currentYear = currentCalendarDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const hasBirthday = aniversariantesDoMes.some((emp) => {
        const birthDate = new Date(emp.data_nascimento);
        return birthDate.getDate() === day;
      });

      const hasFeriado = feriados.some((f) => {
        const feriado = new Date(f.date);
        return feriado.getDate() === day && feriado.getMonth() === currentMonth;
      });

      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      calendar.push({
        day,
        date,
        hasBirthday,
        hasFeriado,
        isToday,
      });
    }

    return {
      monthName: monthNames[currentMonth],
      year: currentYear,
      calendar,
    };
  };

  const calendarData = generateCalendar();

  return (
    <div className="space-y-6">
      {/* Banner de Aniversariantes */}
      {showBirthdayBanner && aniversariantesDoMes.length > 0 && (
        <BirthdayBanner
          funcionarios={aniversariantesDoMes}
          onClose={hideBirthdayBanner}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inicio do card de comunicados recentes */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Newspaper className="w-5 h-5 mr-2 text-blue-600" />
                Comunicados Recentes
              </h3>
              <Button
                variant="blue"
                size="sm"
                onClick={() => onPageChange("news")}
              >
                <span className="flex items-center">
                  Ver todos
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Button>
            </div>

            {/* Lista de comunicados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticiasRecentes.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Nenhum comunicado disponível
                </p>
              ) : (
                noticiasRecentes.map((news) => (
                  <div
                    key={news.id_noticias}
                    className="flex flex-col p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer h-[300px]"
                    onClick={() => handleNewsClick(news)}
                  >
                    <p className="font-medium text-gray-900 text-sm text-center line-clamp-2 mb-2 h-[40px]">
                      {news.titulo}
                    </p>

                    {news.url_imagem && (
                      <img
                        src={news.url_imagem}
                        alt={news.titulo}
                        className="w-full h-[200px] object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-1 py-1 text-xs bg-blue-600 text-white rounded-md mt-2">
                            {news.categoria}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                          {news.criado &&
                            new Date(news.criado).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
        {/* Fim do card de Notícias Recentes */}

        {/* Inicio do card de calendario */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            {/* Header do calendário com navegação */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                {calendarData.monthName} {calendarData.year}
              </h3>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="blue"
                  onClick={handlePreviousMonth}
                  className="p-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="blue"
                  onClick={handleTodayClick}
                  className="px-2 py-1 text-xs"
                >
                  Hoje
                </Button>
                <Button
                  size="sm"
                  variant="blue"
                  onClick={handleNextMonth}
                  className="p-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 p-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarData.calendar.map((day, index) => (
                <div
                  key={day ? day.date.toISOString() : `empty-${index}`}
                  className={`aspect-square flex items-center justify-center text-sm relative transition-colors ${
                    day ? "hover:bg-blue-50 cursor-pointer rounded-lg" : ""
                  } ${
                    day?.isToday
                      ? "bg-blue-100 text-blue-600 font-bold rounded-lg"
                      : ""
                  } ${
                    selectedDate && day && selectedDate.getDate() === day.day
                      ? "bg-blue-200 text-blue-700 rounded-lg"
                      : ""
                  }`}
                  onClick={() => day && handleDateClick(day.date)}
                >
                  {day && (
                    <>
                      <span>{day.day}</span>
                      {day.hasBirthday && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {day.hasFeriado && (
                        <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Aniversários
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Feriados
            </div>
          </div>
        </Card>
        {/* Final do card de calendario */}
      </div>

      {/* Documentos e Notícias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inicio do card de Documentos Recentes */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Documentos Recentes
              </h3>
              <Button
                variant="blue"
                size="sm"
                onClick={() => onPageChange("documents")}
              >
                <span className="flex items-center">
                  Ver todos
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {accessibleDocuments.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Nenhum documento disponível
                </p>
              ) : (
                accessibleDocuments.map((document) => (
                  <div
                    key={document.id_documento}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate ml-2">
                        {document.nome}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2 ml-1">
                          {document.categoria}
                        </span>
                        <div className="flex items-center justify-center space-x-1 mt-2">
                          {getAccessIcon(document.nivel)}
                          <span className="text-xs text-gray-500">
                            {getAccessLabel(document.nivel)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDocumentDownload(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
        {/* Fim do card de Documentos Recentes */}

        {/* Inicio do card de aniversariantes do mês */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                {selectedDate
                  ? `Aniversários - ${selectedDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })}`
                  : `Aniversários de ${calendarData.monthName}`}
              </span>
              {selectedDate && (
                <Button
                  size="sm"
                  variant="blue"
                  onClick={() => setSelectedDate(null)}
                >
                  Ver todos
                </Button>
              )}
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(() => {
                const birthdaysToShow = selectedDate
                  ? aniversariantesDoMes.filter((emp) => {
                      const data = new Date(emp.data_nascimento);
                      return data.getDate() === selectedDate.getDate();
                    })
                  : aniversariantesDoMes;

                return birthdaysToShow.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {selectedDate
                      ? "Nenhum aniversário neste dia"
                      : `Nenhum aniversário em ${calendarData.monthName.toLowerCase()}`}
                  </p>
                ) : (
                  birthdaysToShow.map((employee) => (
                    <div
                      key={employee.id_funcionario}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        {employee.foto ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/${
                              employee.foto
                            }`}
                            alt={employee.funcionario}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {employee.funcionario
                              ? employee.funcionario.charAt(0)
                              : ""}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {employee.funcionario}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            employee.data_nascimento
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                          })}
                        </p>
                      </div>
                      {(() => {
                        const today = new Date();
                        const birthDate = new Date(employee.data_nascimento);
                        const isToday =
                          birthDate.getDate() === today.getDate() &&
                          currentCalendarDate.getMonth() === today.getMonth() &&
                          currentCalendarDate.getFullYear() ===
                            today.getFullYear();

                        return (
                          isToday && (
                            <span className="px-2 py-2 text-sm font-medium bg-blue-600 text-white rounded-full">
                              Hoje! 🎉
                            </span>
                          )
                        );
                      })()}
                    </div>
                  ))
                );
              })()}
            </div>
          </div>
        </Card>
        {/* Final do card de aniversariantes do mês */}
      </div>

      {/* News Modal */}
      <Modal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        title={selectedNews?.titulo || "Notícia"}
        size="xl"
      >
        {selectedNews && (
          <div className="space-y-4">
            {selectedNews.url_imagem && (
              <img
                src={selectedNews.url_imagem}
                alt={selectedNews.titulo}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {selectedNews.criado &&
                  new Date(selectedNews.criado).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center">{selectedNews.author}</div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {selectedNews.categoria}
              </span>
              {selectedNews.url_fonte && (
                <div>
                  <a
                    href={selectedNews.url_fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Fonte: {selectedNews.nome_fonte || "Link externo"}
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Resumo:</h4>
              <p className="text-gray-700">{selectedNews.resumo}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Conteúdo:</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedNews.conteudo}
                </p>
              </div>
            </div>

            {/* {(selectedNews.url_fonte || selectedNews.nome_fonte) && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Fonte:</h4>
                {selectedNews.url_fonte ? (
                  <a
                    href={selectedNews.url_fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="mr-2">🔗</span>
                    {selectedNews.nome_fonte || 'Link da fonte'}
                  </a>
                ) : (
                  <p className="text-gray-600">{selectedNews.nome_fonte}</p>
                )}
              </div>
            )} */}
          </div>
        )}
      </Modal>

      {/* Status do Sistema */}
      {/* <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Status do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Funcionários Ativos</span>
              <span className="text-sm font-medium text-green-600">
                {stats.totalEmployees} ativos
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Documentos</span>
              <span className="text-sm font-medium text-blue-600">
                {accessibleDocuments.length} disponíveis
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Notícias</span>
              <span className="text-sm font-medium text-purple-600">
                {noticiasRecentes.length} publicadas
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Sistema</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
          </div>
        </div>
      </Card> */}
    </div>
  );
};
