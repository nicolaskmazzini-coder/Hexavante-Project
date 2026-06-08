-- Rodar no DBeaver no banco `hexavante`
-- Tabelas do Auth.js (NextAuth) — compatível com users.id INT

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(191) NOT NULL,
  provider VARCHAR(191) NOT NULL,
  provider_account_id VARCHAR(191) NOT NULL,
  refresh_token TEXT NULL,
  access_token TEXT NULL,
  expires_at INT NULL,
  token_type VARCHAR(191) NULL,
  scope VARCHAR(191) NULL,
  id_token TEXT NULL,
  session_state VARCHAR(191) NULL,
  UNIQUE KEY accounts_provider_provider_account_id (provider, provider_account_id),
  KEY accounts_user_id (user_id),
  CONSTRAINT accounts_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  session_token VARCHAR(191) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  expires DATETIME(3) NOT NULL,
  KEY sessions_user_id (user_id),
  CONSTRAINT sessions_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(191) NOT NULL,
  token VARCHAR(191) NOT NULL UNIQUE,
  expires DATETIME(3) NOT NULL,
  UNIQUE KEY verification_tokens_identifier_token (identifier, token)
);
