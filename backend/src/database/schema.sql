-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sistema_licitacao;
USE sistema_licitacao;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'usuario') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de fluxos
CREATE TABLE IF NOT EXISTS fluxos (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    etapas TEXT NOT NULL,
    status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    usuario_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de processos
CREATE TABLE IF NOT EXISTS processos (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    fluxo_id VARCHAR(36),
    documentos TEXT,
    status ENUM('em_andamento', 'concluido', 'cancelado') NOT NULL DEFAULT 'em_andamento',
    etapa_atual INT NOT NULL DEFAULT 1,
    usuario_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fluxo_id) REFERENCES fluxos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_status (status),
    INDEX idx_fluxo (fluxo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de histórico de processos
CREATE TABLE IF NOT EXISTS historico_processos (
    id VARCHAR(36) PRIMARY KEY,
    processo_id VARCHAR(36),
    etapa INT NOT NULL,
    observacao TEXT,
    usuario_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processo_id) REFERENCES processos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_processo (processo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trigger para atualizar updated_at
DELIMITER //
CREATE TRIGGER before_fluxos_update 
    BEFORE UPDATE ON fluxos
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER before_processos_update
    BEFORE UPDATE ON processos
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;
