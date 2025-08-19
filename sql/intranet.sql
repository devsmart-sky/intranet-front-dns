/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80030 (8.0.30)
 Source Host           : localhost:3306
 Source Schema         : intranet

 Target Server Type    : MySQL
 Target Server Version : 80030 (8.0.30)
 File Encoding         : 65001

 Date: 23/07/2025 10:36:58
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for acesso
-- ----------------------------
DROP TABLE IF EXISTS `acesso`;
CREATE TABLE `acesso`  (
  `id_acesso` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_layout` int NOT NULL,
  `acesso` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `inclusao` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `exclusao` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `alteracao` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `consulta` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `impressao` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id_acesso`, `id_usuario`, `id_layout`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of acesso
-- ----------------------------
INSERT INTO `acesso` VALUES (1, 4, 1, '1', '1', '1', '1', '1', '1');
INSERT INTO `acesso` VALUES (2, 4, 2, '1', '1', '1', '1', '1', '1');
INSERT INTO `acesso` VALUES (3, 4, 3, '1', '1', '1', '1', '1', '1');
INSERT INTO `acesso` VALUES (4, 4, 4, '1', '1', '1', '1', '1', '1');
INSERT INTO `acesso` VALUES (5, 4, 5, '1', '1', '1', '1', '1', '1');
INSERT INTO `acesso` VALUES (6, 4, 6, '1', '1', '1', '1', '1', '1');
INSERT INTO `acesso` VALUES (7, 4, 7, '1', '1', '1', '1', '1', '1');

-- ----------------------------
-- Table structure for cargos
-- ----------------------------
DROP TABLE IF EXISTS `cargos`;
CREATE TABLE `cargos`  (
  `id_cargo` int NOT NULL,
  `cargo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `descricao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` enum('Ativo','Inativo','') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Ativo',
  `criado` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `alterado` timestamp NULL DEFAULT NULL,
  `excluido` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cargo`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of cargos
-- ----------------------------
INSERT INTO `cargos` VALUES (1, 'Gerente', 'teste gerente', 'Ativo', '2025-07-11 16:43:00', NULL, NULL);
INSERT INTO `cargos` VALUES (2, 'Analista de Dev Jr', 'teste1', 'Ativo', '2025-07-11 16:43:09', NULL, NULL);
INSERT INTO `cargos` VALUES (3, 'Programador', 'teste2', 'Ativo', '2025-07-11 16:43:11', NULL, NULL);
INSERT INTO `cargos` VALUES (5, 'Desenvolvedor Full Stack Jr', 'teste3', 'Ativo', '2025-07-11 16:43:13', NULL, NULL);
INSERT INTO `cargos` VALUES (6, 'Aux. Administrativo', 'teste4', 'Ativo', '2025-07-11 16:43:16', NULL, NULL);
INSERT INTO `cargos` VALUES (7, 'Comprador', 'teste5', 'Ativo', '2025-07-11 16:43:18', NULL, NULL);
INSERT INTO `cargos` VALUES (8, 'Gestor Desenvolvimento', 'teste6', 'Ativo', '2025-07-11 16:43:21', NULL, NULL);
INSERT INTO `cargos` VALUES (9, 'Desenvolvedor Full Stack Sr', 'teste7', 'Ativo', '2025-07-11 16:43:23', NULL, NULL);
INSERT INTO `cargos` VALUES (10, 'Desenvolvedor Full Stack Pleno', 'teste8', 'Ativo', '2025-07-11 16:43:26', NULL, NULL);
INSERT INTO `cargos` VALUES (11, 'Analista Administrativo', NULL, 'Ativo', '2025-06-12 17:04:58', NULL, NULL);
INSERT INTO `cargos` VALUES (12, 'Gestor de Contrato', NULL, 'Ativo', '2025-06-16 13:26:32', NULL, NULL);
INSERT INTO `cargos` VALUES (13, 'Gestor', NULL, 'Ativo', '2025-06-16 13:26:35', NULL, NULL);
INSERT INTO `cargos` VALUES (14, 'Analista GIS Sênior', NULL, 'Ativo', '2025-06-16 13:26:35', NULL, NULL);
INSERT INTO `cargos` VALUES (15, 'Analista Admistrativo', NULL, 'Ativo', '2025-06-16 13:26:35', NULL, NULL);
INSERT INTO `cargos` VALUES (16, 'Analista Infra', NULL, 'Inativo', '2025-07-11 15:42:22', NULL, NULL);
INSERT INTO `cargos` VALUES (17, 'Especialista Dev', NULL, 'Ativo', '2025-06-16 13:26:35', NULL, NULL);

-- ----------------------------
-- Table structure for cliente
-- ----------------------------
DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente`  (
  `id_cliente` int NOT NULL,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `endereco` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `telefone` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `foto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `dt_inclusao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_alteracao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dt_delete` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id_cliente`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of cliente
-- ----------------------------
INSERT INTO `cliente` VALUES (1, 'Marcos Miranda', 'Av. Paulista', '11 96758-7988', 'active', NULL, '2024-09-17 18:43:55', '2025-02-25 11:50:35', '2025-02-25 11:50:35', 'xpto@uol.com.br');
INSERT INTO `cliente` VALUES (2, 'Long Chen', 'Rua Oscar Freire', '11 96758-7988', 'inactive', NULL, '2024-09-17 22:43:44', '2025-02-25 11:51:00', '2025-02-25 11:51:00', 'testetese@hotmail.com');
INSERT INTO `cliente` VALUES (3, 'Katusit M. G Ltda.', 'Rua Augusta', '11 96758-7988', 'active', NULL, '2024-09-19 06:43:35', '2025-02-25 11:51:08', '2025-02-25 11:51:08', 'testeuol@hotmail.com');
INSERT INTO `cliente` VALUES (4, 'Ricardo Oliveira', 'Rua Santo Irineu', '11 96758-7988', 'active', NULL, '2025-02-25 09:39:58', '2025-02-25 11:51:15', '2025-02-25 11:51:15', 'marcelocastilho@hotmail.com');
INSERT INTO `cliente` VALUES (5, 'Mariana Santos', 'Av. Ricardo Jaffet', '11 96758-7988', 'active', NULL, '2025-02-25 09:41:03', '2025-02-25 11:51:16', '2025-02-25 11:51:16', 'castilhomcw@hotmail.com');
INSERT INTO `cliente` VALUES (6, 'Carlos Mendes', 'Rua Augusta', '11 96758-7988', 'inactive', NULL, '2025-02-25 09:42:47', '2025-02-25 11:51:24', '2025-02-25 11:51:24', 'lucas@smartsky.com.br');
INSERT INTO `cliente` VALUES (7, 'Katusit M. G Ltda.', 'Rua Santo Irineu', '11 96758-7988', 'active', NULL, '2025-02-25 09:43:05', '2025-02-25 11:50:38', '2025-02-25 11:50:38', 'xpto@uol.com.br');
INSERT INTO `cliente` VALUES (8, 'Marcos Miranda', 'Rua Oscar Freire', '11 96758-7988', 'inactive', NULL, '2025-02-25 09:43:24', '2025-02-25 11:50:38', '2025-02-25 11:50:38', 'xpto@uol.com.br');

-- ----------------------------
-- Table structure for departamentos
-- ----------------------------
DROP TABLE IF EXISTS `departamentos`;
CREATE TABLE `departamentos`  (
  `id_departamento` int NOT NULL,
  `departamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `descricao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` enum('Ativo','Inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Ativo',
  `criado` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `alterado` timestamp NULL DEFAULT NULL,
  `excluido` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_departamento`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of departamentos
-- ----------------------------
INSERT INTO `departamentos` VALUES (1, 'Recursos Humanos', 'Gestão de pessoas e processos organizacionais', 'Ativo', '2025-06-13 15:23:14', '2025-06-13 15:22:47', NULL);
INSERT INTO `departamentos` VALUES (2, 'Tecnologia e Infraestrutura', 'Desenvolvimento de software e infraestrutura', 'Ativo', '2025-06-16 14:09:32', '2025-06-16 14:09:32', NULL);
INSERT INTO `departamentos` VALUES (3, 'Financeiro', 'Controle financeiro e contabilidade', 'Inativo', '2025-06-16 13:41:41', '2025-06-16 13:41:42', NULL);
INSERT INTO `departamentos` VALUES (4, 'Suprimentos', 'Aquisição e gerenciamento de materiais e serviços', 'Inativo', '2025-06-16 14:24:03', '2025-06-16 14:24:04', NULL);
INSERT INTO `departamentos` VALUES (5, 'Administrativo', 'Apoio às operações internas e suporte administrativo', 'Ativo', '2025-06-16 13:01:23', '2025-06-16 13:01:24', NULL);
INSERT INTO `departamentos` VALUES (7, 'Almoxarifado', 'Armazenamento, controle e distribuição de materiais', 'Inativo', '2025-06-16 14:14:12', '2025-06-16 14:14:12', NULL);
INSERT INTO `departamentos` VALUES (9, 'Comercial', 'Gestão de vendas e relacionamento com clientes', 'Inativo', '2025-06-16 13:04:52', '2025-06-16 13:04:53', NULL);
INSERT INTO `departamentos` VALUES (11, 'Engenharia', 'A engenharia combina ciência e criatividade para criar soluções inovadoras.', 'Ativo', '2025-06-16 15:17:35', '2025-06-16 13:05:04', NULL);
INSERT INTO `departamentos` VALUES (12, 'Operações', 'Gestão e execução de processos operacionais.', 'Ativo', '2025-07-08 09:36:12', '2025-06-16 13:58:08', NULL);

-- ----------------------------
-- Table structure for documento
-- ----------------------------
DROP TABLE IF EXISTS `documento`;
CREATE TABLE `documento`  (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_funcionario` int NOT NULL,
  `nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NULL DEFAULT NULL,
  `descricao` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `categoria` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `arquivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `criado` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `excluido` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_documento`, `id_funcionario`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = armscii8 COLLATE = armscii8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of documento
-- ----------------------------
INSERT INTO `documento` VALUES (11, 1, 'Informativo T.I', 'Segurança da informação nas mídias sociais.', 'Tecnologia e Infraestrutura', '1750192252333_segurança.png', '2025-06-17 17:30:52', NULL);
INSERT INTO `documento` VALUES (12, 1, 'Smart Sky - Nova logo', 'Nova logo Smart Sky', 'Recursos Humanos', '1750192934329_Vertical_Médio_800w_Colorido.png', '2025-06-17 17:42:14', NULL);
INSERT INTO `documento` VALUES (13, 1, 'Diretrizes de uso', 'Diretrizes de uso da logo', 'Recursos Humanos', '1750193057421_Timbrados - Diretrizes de Uso.pdf', '2025-06-17 17:44:17', NULL);

-- ----------------------------
-- Table structure for empresa
-- ----------------------------
DROP TABLE IF EXISTS `empresa`;
CREATE TABLE `empresa`  (
  `id_empresa` int NOT NULL,
  `empresa` varchar(100) CHARACTER SET armscii8 COLLATE armscii8_bin NULL DEFAULT NULL,
  `cnpj` varchar(100) CHARACTER SET armscii8 COLLATE armscii8_bin NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET armscii8 COLLATE armscii8_bin NULL DEFAULT NULL,
  `telefone` varchar(50) CHARACTER SET armscii8 COLLATE armscii8_bin NULL DEFAULT NULL,
  `logo` varchar(100) CHARACTER SET armscii8 COLLATE armscii8_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id_empresa`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = armscii8 COLLATE = armscii8_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of empresa
-- ----------------------------
INSERT INTO `empresa` VALUES (1, 'Empresa ABC Ltda', '12.345.678/0001-90', 'contato@empresaabc.com.br', '(11) 3333-4444', NULL);
INSERT INTO `empresa` VALUES (2, 'Tech Solutions S.A.', '98.765.432/0001-10', 'contato@techsolutions.com', '(11) 5555-6666', NULL);
INSERT INTO `empresa` VALUES (3, 'Comercio Rapido', '45.678.901/0001-23', 'contato@comerciorapido.com.br', '(11) 7777-8888', NULL);

-- ----------------------------
-- Table structure for funcionarios
-- ----------------------------
DROP TABLE IF EXISTS `funcionarios`;
CREATE TABLE `funcionarios`  (
  `id_funcionario` int NOT NULL AUTO_INCREMENT,
  `id_departamento` int NOT NULL,
  `id_cargo` int NOT NULL,
  `data_admissao` date NULL DEFAULT NULL,
  `funcionario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `tipo_contrato` enum('CLT','PJ','EST') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `cnpj` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `razao_social` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `cep` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `endereco` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `uf` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `data_nascimento` date NULL DEFAULT NULL,
  `foto` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `descricao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` enum('Ativo','Inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Ativo',
  `criado` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `alterado` timestamp NULL DEFAULT NULL,
  `excluido` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_funcionario`, `id_departamento`, `id_cargo`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 67 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of funcionarios
-- ----------------------------
INSERT INTO `funcionarios` VALUES (3, 3, 3, '2025-07-08', 'Ana Costa', 'ana@empresa.com', '(21) 98765-4321', 'CLT', '321.654.987-00', NULL, NULL, NULL, 'Rua das Laranjeiras, 789', 'Centro', 'Rio de Janeiro', 'RJ', '1992-10-10', NULL, 'teste', 'Ativo', '2025-07-11 11:43:21', NULL, NULL);
INSERT INTO `funcionarios` VALUES (6, 11, 6, '2025-07-09', 'Roberto Mendonça', 'castilho4dstudio@gmail.com', '11948577539', 'PJ', '12345678900', '00425152000196', '4DStudo Designer xuxu', NULL, 'Rua das Figueiras, 77', 'Liberdade', 'São Paulo', 'RJ', '2025-07-09', NULL, 'teste', 'Ativo', NULL, NULL, NULL);
INSERT INTO `funcionarios` VALUES (8, 7, 15, '2025-07-10', 'José Roberto', 'castilhomcw@hotmail.com', '11234234234', 'EST', '34543543534', NULL, NULL, NULL, 'Rua das palmeiras, 46', 'Vila Torres', 'Guarulhos', 'SP', '2025-07-10', NULL, 'teste', 'Ativo', '2025-07-10 10:00:19', NULL, NULL);
INSERT INTO `funcionarios` VALUES (9, 9, 2, '2025-07-10', 'Marcell Gomes ', 'castilhomcw@hotmail.com', '23432432432', 'PJ', '34543543534', '34324324324343', 'Eng. Consult ME', NULL, 'R. dos lavapes, 56', 'Vila Mariana', 'São Paulo', 'SP', '2025-07-10', NULL, 'teste', 'Ativo', '2025-07-10 10:02:57', NULL, NULL);
INSERT INTO `funcionarios` VALUES (10, 12, 9, '2025-07-10', 'João Salgado', 'jaos@uol.com.br', '23432432434', 'EST', '32432434324', NULL, NULL, NULL, 'Rua santo irineu, 56', 'Vila Mariana', 'São Paulo', 'SP', '2025-07-10', NULL, 'teste', 'Ativo', NULL, NULL, NULL);
INSERT INTO `funcionarios` VALUES (24, 1, 10, '2025-07-24', 'Jonas Ribeiro', 'ronasr@uol.com.br', '23423423423', 'CLT', '32423423432', NULL, NULL, NULL, 'Rua das Lavouras, 57', 'Vila maria', 'Distrito Federal', 'DF', '2025-07-11', NULL, 'sadfsdaf', 'Ativo', NULL, NULL, NULL);
INSERT INTO `funcionarios` VALUES (25, 2, 17, '2025-07-22', 'Jessica Gomes C Silva', 'jsg@uol.com.br', '23432432432', 'PJ', '32423423423', '02.786.687/0001-78', 'Eng. Construção Ltda.', '01528-010', 'Largo Nossa Senhora da Conceição, 74', 'Cambuci', 'São Paulo', 'SP', '2025-07-11', 'data:image/png;base64,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', 'teste', 'Ativo', '2025-07-21 17:35:10', NULL, NULL);
INSERT INTO `funcionarios` VALUES (64, 4, 12, '2025-07-01', 'Marcelo Castilho Silva totox', 'asdfsadf', '(11) 96857-8978', 'EST', '', '', '', '01528-060', 'Rua Santo Irineu, 114', 'Vila Maria', 'São Paulo', 'SP', '2025-07-21', 'data:image/jpeg;base64,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', 'teste', 'Ativo', '2025-07-21 17:34:48', NULL, NULL);
INSERT INTO `funcionarios` VALUES (65, 4, 10, '2025-07-31', 'Marcos Rogerio Neves', 'cmlt@uol.com.br', '(11) 5768-9089', 'CLT', '', '', '', '015280060', 'Rua Oscar Cintra Gorginho, 151', 'Vila Mariana', 'São Paulo', 'SP', '2025-07-01', 'data:image/jpeg;base64,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', 'teste', 'Ativo', '2025-07-21 17:33:59', NULL, NULL);

-- ----------------------------
-- Table structure for layout
-- ----------------------------
DROP TABLE IF EXISTS `layout`;
CREATE TABLE `layout`  (
  `id_layout` int NOT NULL,
  `icon` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `modulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rota` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of layout
-- ----------------------------
INSERT INTO `layout` VALUES (1, 'Gauge', 'Dashboard', 'dashboard');
INSERT INTO `layout` VALUES (2, 'UsersRound', 'Funcionários', 'funcionarios');
INSERT INTO `layout` VALUES (3, 'Contact', 'Cargos', 'cargos');
INSERT INTO `layout` VALUES (4, 'Grip', 'Departamentos', 'departamentos');
INSERT INTO `layout` VALUES (5, 'User', 'Usuários', 'usuarios');
INSERT INTO `layout` VALUES (6, 'File', 'Documentos', 'documentos');
INSERT INTO `layout` VALUES (7, 'Settings', 'Configurações', 'settings');
INSERT INTO `layout` VALUES (8, 'LogOut', 'Sair', 'login');

-- ----------------------------
-- Table structure for notificacao
-- ----------------------------
DROP TABLE IF EXISTS `notificacao`;
CREATE TABLE `notificacao`  (
  `id_notificacao` int NOT NULL,
  `id_departamento` int NULL DEFAULT NULL,
  `titulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `notificacao` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `prioridade` enum('Alto','Médio','Baixo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `novo` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'true',
  `criado` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacao`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of notificacao
-- ----------------------------
INSERT INTO `notificacao` VALUES (1, 1, 'Nova política de home office', 'A partir de janeiro, implementaremos uma nova política de trabalho híbrido.', 'Tecnologia', 'Alto', 'true', '2025-06-09 08:40:44');
INSERT INTO `notificacao` VALUES (2, 6, 'Manutenção do sistema programada', 'Haverá manutenção programada nos sistemas. Alguns serviços podem ficar indisponíveis.', 'Tecnologia', 'Alto', 'true', '2025-06-09 08:40:44');
INSERT INTO `notificacao` VALUES (3, 1, 'Bem-vindos novos funcionários!', 'Damos as boas-vindas aos novos membros da equipe que iniciaram este mês.', 'Tecnologia', 'Médio', 'true', '2025-06-09 08:40:45');
INSERT INTO `notificacao` VALUES (4, 2, 'Treinamento obrigatório', 'Todos os colaboradores devem participar do treinamento sobre a Lei Geral de Proteção de Dados até o final do mês.', 'Tecnologia', 'Alto', 'true', '2025-06-09 08:40:45');
INSERT INTO `notificacao` VALUES (5, 6, 'Inteligência Artificial Revoluciona Medicina', 'Uma nova tecnologia de IA está transformando diagnósticos médicos com precisão de 98%. O sistema utiliza algoritmos avançados de machine learning para analisar exames de imagem e detectar anomalias que podem passar despercebidas pelo olho humano. Segundo os pesquisadores da Universidade de Stanford, esta tecnologia pode reduzir significativamente o tempo de diagnóstico e aumentar a taxa de detecção precoce de doenças. Os testes clínicos mostraram resultados promissores em diversas especialidades médicas, incluindo radiologia, dermatologia e oftalmologia. A implementação desta tecnologia em hospitais brasileiros está prevista para o próximo semestre, com potencial para revolucionar o sistema de saúde nacional.', 'Tecnologia', 'Médio', 'true', '2025-06-09 08:40:46');
INSERT INTO `notificacao` VALUES (6, 3, 'Mercado Financeiro Registra Alta Histórica', 'As ações da bolsa brasileira atingiram novo patamar recorde hoje, impulsionadas pelo setor de tecnologia e commodities. O Índice Bovespa fechou com alta de 3.2%, sendo o melhor desempenho do ano. Analistas apontam que a recuperação econômica pós-pandemia e os investimentos em infraestrutura digital são os principais fatores responsáveis por este crescimento. O setor de energia renovável também apresentou destaque, com empresas do ramo solar e eólico liderando os ganhos. Especialistas recomendam cautela aos investidores, lembrando que o mercado ainda enfrenta volatilidade devido a fatores externos como inflação global e tensões geopolíticas.', 'Tecnologia', 'Baixo', 'true', '2025-06-09 08:40:46');
INSERT INTO `notificacao` VALUES (7, 1, 'Sustentabilidade: Nova Lei Ambiental', 'O governo aprovou nova legislação que estabelece metas ambiciosas para redução de carbono até 2030. A lei prevê incentivos fiscais para empresas que adotarem práticas sustentáveis e penalidades para aquelas que não cumprirem os novos padrões ambientais. Entre as principais medidas estão a obrigatoriedade de uso de energia renovável em indústrias de grande porte, a implementação de sistemas de reciclagem obrigatórios e a criação de fundos para reflorestamento. Especialistas em meio ambiente consideram esta legislação um marco histórico para o país, podendo servir de modelo para outras nações. A implementação será gradual, com prazo de dois anos para adequação completa das empresas.', 'Tecnologia', 'Baixo', 'true', '2025-06-09 08:44:47');

-- ----------------------------
-- Table structure for notificacoes_lidas
-- ----------------------------
DROP TABLE IF EXISTS `notificacoes_lidas`;
CREATE TABLE `notificacoes_lidas`  (
  `id_usuario` int NOT NULL,
  `id_notificacao` int NOT NULL,
  `data_leitura` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`, `id_notificacao`) USING BTREE,
  INDEX `notificacao_foreingn`(`id_notificacao` ASC) USING BTREE,
  CONSTRAINT `notificacao_foreingn` FOREIGN KEY (`id_notificacao`) REFERENCES `notificacao` (`id_notificacao`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `usuario_foreingn` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = armscii8 COLLATE = armscii8_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of notificacoes_lidas
-- ----------------------------

-- ----------------------------
-- Table structure for usuario
-- ----------------------------
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario`  (
  `id_usuario` int NOT NULL,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `usuario` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `nivel` enum('Usuário','Administrador') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Administrador',
  `status` enum('Ativo','Inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Ativo',
  `avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `criado` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `alterado` timestamp NULL DEFAULT NULL,
  `excluido` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of usuario
-- ----------------------------

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `permissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO `usuarios` VALUES (1, 'admin', '$2b$10$foEA0n7zKOxcVWtR.PvCF.XAfGPCW9SO1J54F2jR./teHju9sQR3a', 'Administrador', 'admin@admin.com', 'admin', '[\"dashboard\", \"employees\", \"cargos\",\"departamentos\",\"documents\", \"news\", \"reports\", \"users\"]');
INSERT INTO `usuarios` VALUES (2, 'user', '$2b$10$foEA0n7zKOxcVWtR.PvCF.XAfGPCW9SO1J54F2jR./teHju9sQR3a', 'João Silva', 'joao@empresa.com', 'user', '[\"dashboard\", \"documents\", \"reports\"]');

-- ----------------------------
-- View structure for view_acesso
-- ----------------------------


-- ----------------------------
-- View structure for view_cargos
-- ----------------------------


-- ----------------------------
-- View structure for view_departamentos
-- ----------------------------


-- ----------------------------
-- View structure for view_funcionarios
-- ----------------------------


-- ----------------------------
-- View structure for view_layout
-- ----------------------------


SET FOREIGN_KEY_CHECKS = 1;
