import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { News } from "../types";
import { mockNews } from "../services/mockData";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast } from "../components/ui/Toast";
import { showDeleteConfirmation } from "../utils/alerts";
import axios from "axios";

export const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>(mockNews);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [formData, setFormData] = useState<Partial<News>>({
    titulo: "",
    conteudo: "",
    resumo: "",
    url_imagem: "",
    url_fonte: "",
    nome_fonte: "",
    categoria: "",
    ativo: 1,
    destaque: 0,
    criado: new Date(),
  });

  // Filtrar notícias
  const filteredNews = news.filter(
    (item) =>
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (mode: "view" | "edit" | "create", newsItem?: News) => {
    setModalMode(mode);
    if (newsItem) {
      setSelectedNews(newsItem);
      setFormData(newsItem);
    } else {
      setSelectedNews(null);
      setFormData({
        titulo: "",
        conteudo: "",
        resumo: "",
        url_imagem: "",
        url_fonte: "",
        nome_fonte: "",
        categoria: "",
        ativo: 1,
        destaque: 0,
        criado: new Date(),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  // Funcionalidade para salvar as notícias
  const handleSave = async () => {
    if (modalMode === "create") {
      // const newNews: News = {
      //   ...formData as News,
      //   id_noticias: Date.now().toString(),
      //   author: user?.name || 'Usuário',
      //   views: 0,
      //   criado: new Date()
      // };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/noticias`,
          {
            titulo: formData.titulo,
            resumo: formData.resumo,
            conteudo: formData.conteudo,
            categoria: formData.categoria,
            url_imagem: formData.url_imagem,
            url_fonte: formData.url_fonte,
            nome_fonte: formData.nome_fonte,
            ativo: formData.ativo ?? 1,
            destaque: formData.destaque ?? 0,
            criado: new Date().toISOString(),
          }
        );

        if (response.status === 201) {
          showSuccessToast(`Notícia ${formData.titulo} criada com sucesso!`);
          await getNoticias(); // <-- força atualização com dados reais do backend
        }
      } catch (error) {
        console.error("Erro ao criar noticia:", error);
      }
    } else if (modalMode === "edit" && selectedNews) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/noticias/${
            selectedNews.id_noticias
          }`,
          {
            titulo: formData.titulo,
            resumo: formData.resumo,
            conteudo: formData.conteudo,
            categoria: formData.categoria,
            url_imagem: formData.url_imagem,
            url_fonte: formData.url_fonte,
            nome_fonte: formData.nome_fonte,
            ativo: formData.ativo ?? 1,
            destaque: formData.destaque ?? 0,
          }
        );

        if (response.status === 200) {
          showSuccessToast(
            `Noticia ${formData.titulo} atualizada com sucesso!`
          );
          await getNoticias(); // <-- força atualização com dados reais do backend
        }
      } catch (err) {
        console.error("Erro ao atualizar noticia:", err);
      }
    }
    closeModal();
  };

  // Funcionalidade para excluir as notícias
  const handleDelete = async (id: string) => {
    const newsItem = news.find((item) => item.id_noticias === id);
    const confirmed = await showDeleteConfirmation(
      "Excluir notícia?",
      `Tem certeza que deseja excluir a notícia "${newsItem?.titulo}"? Esta ação não pode ser desfeita.`,
      "Sim, excluir"
    );

    if (confirmed) {
      try {
        const responde = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/noticias/${id}`
        );

        if (responde.status === 200) {
          showSuccessToast(`Noticia ${newsItem?.titulo} excluida com sucesso!`);
          4;
          await getNoticias(); // <-- força atualização com dados reais do backend
        }
      } catch (err) {
        console.error("Erro ao excluir noticia:", err);
      }
    }
  };

  const incrementViews = (id: string) => {
    setNews(
      news.map((item) =>
        item.id_noticias === id ? { ...item, views: item.views + 1 } : item
      )
    );
  };

  const handleViewNews = (newsItem: News) => {
    incrementViews(newsItem.id_noticias);
    openModal("view", newsItem);
  };

  // Função para buscar notícias
  const getNoticias = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/noticias`
      );

      setNews(response.data);
    } catch (error) {
      console.error("Erro ao buscar comunicados:", error);
    }
  };

  useEffect(() => {
    getNoticias();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* <h2 className="text-2xl font-bold text-white">Comunicados</h2> */}
          <p className="text-2xl text-gray-300">
            Fique por dentro das últimas novidades
          </p>
        </div>
        {user?.role === "admin" && (
          <Button icon={Plus} onClick={() => openModal("create")}>
            Novo Comunicado
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar comunicados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
            {/* <Button variant="secondary" icon={Filter}>
              Filtros
            </Button> */}
          </div>
        </div>
      </Card>

      {/* Featured News */}
      {filteredNews.some((item) => item.destaque) && (
        <div>
          {/* Comunicado em Destaque */}
          <h3 className="text-lg font-semibold text-white mb-4">
            Comunicado em Destaque
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredNews
              .filter((item) => item.destaque)
              .slice(0, 2)
              .map((newsItem) => (
                <Card key={newsItem.id_noticias} className="overflow-hidden">
                  {newsItem.url_imagem && (
                    <img
                      src={newsItem.url_imagem}
                      alt={newsItem.titulo}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {newsItem.categoria}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Destaque
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {newsItem.titulo}
                    </h3>
                    <p className="text-gray-600 mb-4">{newsItem.resumo}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      {/* <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {newsItem.author}
                    </div> */}
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {newsItem.criado &&
                          new Date(newsItem.criado).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      {/* <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {newsItem.views} visualizações
                    </div> */}
                      {newsItem.url_fonte && (
                        <a
                          href={newsItem.url_fonte}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {newsItem.nome_fonte || "Fonte"}
                        </a>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="blue"
                        onClick={() => handleViewNews(newsItem)}
                      >
                        Ler Mais
                      </Button>
                      {user?.role === "admin" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => openModal("edit", newsItem)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(newsItem.id_noticias)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Todos os comunicados */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Todas os Comunicados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews
            .filter((item) => !item.destaque)
            .map((newsItem) => (
              <Card key={newsItem.id_noticias} className="overflow-hidden">
                {newsItem.url_imagem && (
                  <img
                    src={newsItem.url_imagem}
                    alt={newsItem.titulo}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {newsItem.categoria}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {newsItem.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {newsItem.resumo}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    {/* <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {newsItem.author}
                    </div> */}
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {newsItem.criado &&
                        new Date(newsItem.criado).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {/* <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {newsItem.views} visualizações
                    </div> */}
                    {newsItem.url_fonte && (
                      <a
                        href={newsItem.url_fonte}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {newsItem.nome_fonte || "Fonte"}
                      </a>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="blue"
                      onClick={() => handleViewNews(newsItem)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ler
                    </Button>
                    {user?.role === "admin" && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openModal("edit", newsItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(newsItem.id_noticias)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Nova Notícia"
            : modalMode === "edit"
            ? "Editar Notícia"
            : selectedNews?.titulo || "Visualizar Notícia"
        }
        size="xl"
      >
        <div className="space-y-4">
          {modalMode === "view" && selectedNews ? (
            <div className="space-y-4">
              {selectedNews.url_imagem && (
                <img
                  src={selectedNews.url_imagem}
                  alt={selectedNews.titulo}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {/* <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {selectedNews.author}
                </div> */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(selectedNews.criado).toLocaleDateString("pt-BR")}
                </div>
                {/* <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {selectedNews.views} visualizações
                </div> */}
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedNews.conteudo}
                </p>
              </div>
              {selectedNews.url_fonte && (
                <div className="pt-4 border-t">
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
          ) : (
            <>
              <Input
                label="Título"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                disabled={modalMode === "view"}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resumo
                </label>
                <textarea
                  value={formData.resumo}
                  onChange={(e) =>
                    setFormData({ ...formData, resumo: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <textarea
                  value={formData.conteudo}
                  onChange={(e) =>
                    setFormData({ ...formData, conteudo: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Categoria"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />

                <Input
                  label="URL da Imagem"
                  value={formData.url_imagem}
                  onChange={(e) =>
                    setFormData({ ...formData, url_imagem: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />

                <Input
                  label="URL da Fonte"
                  value={formData.url_fonte}
                  onChange={(e) =>
                    setFormData({ ...formData, url_fonte: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />

                <Input
                  label="Nome da Fonte"
                  value={formData.nome_fonte}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_fonte: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="imageUpload"
                  className="block text-sm font-medium text-gray-700"
                >
                  Imagem do Comunicado
                </label>
                <Input
                  type="file"
                  id="imageUpload"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="mt-1 mb-2"
                />
              </div>

              {modalMode !== "view" && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={!!formData.ativo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ativo: e.target.checked ? 1 : 0,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Ativo
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={!!formData.destaque}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destaque: e.target.checked ? 1 : 0,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isFeatured"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Destaque
                    </label>
                  </div>
                </div>
              )}

              {modalMode !== "view" && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="secondary" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {modalMode === "create" ? "Criar" : "Salvar"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
