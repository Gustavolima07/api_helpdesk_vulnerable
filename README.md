# API 02 — Help Desk Lab

Projeto educacional de **API REST simples**, desenvolvido em **Node.js + Express** e **PostgreSQL via Docker**. Os dados são fictícios e a aplicação contém falhas intencionais para uma atividade de investigação e correção de segurança.

> **ATENÇÃO:** Execute somente em seu computador, em laboratório autorizado e sem exposição à internet. Não reutilize este projeto em produção. O serviço Node e a porta PostgreSQL estão configurados para escutar apenas em `127.0.0.1`.

## Requisitos

- Node.js **20 ou superior**
- Docker Desktop ou Docker Engine com Compose
- Postman, Insomnia ou outro cliente HTTP (opcional)

## Como iniciar

1. Clone o repositório e entre na pasta do projeto:
   ```bash
   git clone https://github.com/profalonsogui/api_helpdesk_vulnerable.git
   cd api_helpdesk_vulnerable
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` com base no exemplo:
   - **PowerShell:** `Copy-Item .env.example .env`
   - **Linux/macOS:** `cp .env.example .env`
4. Inicie o banco de dados PostgreSQL com Docker:
   ```bash
   docker compose up -d
   ```
5. Inicie a API:
   ```bash
   npm run dev
   ```
   Para executar sem modo de desenvolvimento, use `npm start`.
6. Abra `http://127.0.0.1:3001/api/health` e confirme o status de conexão.

A primeira inicialização do container executa `database/init.sql` e cadastra os dados fictícios.

Se o volume PostgreSQL já existia antes das correções de segurança, aplique a migração uma vez:

```powershell
Get-Content -Raw database/migrate_security.sql | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U lab_user -d helpdesk_lab
```

**Portas:** API `3001`, PostgreSQL `5433` (no host). Foram escolhidas para evitar conflito com a API de E-commerce do laboratório (`3000` e `5432`).

## Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Apresentação do laboratório |
| GET | `/api/health` | Teste de conexão com o banco |
| GET | `/api/tickets` | Lista de chamados |
| GET | `/api/tickets/search?term=Wi-Fi` | Pesquisa por título |
| GET | `/api/tickets/1` | Detalhamento de chamado |
| POST | `/api/users/login` | Login demonstrativo |

Corpo JSON de exemplo para o login (somente credenciais fictícias):

```json
{"email":"ana@example.test","password":"ana123"}
```

Usuários fictícios de teste: `ana@example.test`, `bruno@example.test`, `carla@example.test`. As respectivas senhas constam do `database/init.sql` para fins de laboratório.

As rotas de chamados exigem autenticação. Faça login com `POST /api/users/login` e envie o token retornado no cabeçalho `Authorization: Bearer <token>` nas chamadas a `/api/tickets`. Cada usuário requester vê apenas os próprios chamados; o perfil support pode consultar todos. Os tokens expiram em uma hora. Para manter tokens válidos após reiniciar a API, defina `AUTH_TOKEN_SECRET` no `.env`; se omitido, a API gera um segredo aleatório ao iniciar.

## Atividade dos grupos

1. Execute a API e observe o comportamento dos endpoints.
2. Analise o código em `src/` e o modelo de banco em `database/init.sql`.
3. Identifique **pelo menos três** falhas ou práticas inseguras.
4. Descreva o risco de cada problema e apresente evidências de testes locais.
5. Implemente correções e teste novamente.
6. Entregue o código corrigido e um relatório de **2 a 4 páginas** (falha, evidência, risco, solução e conclusão).

## Comandos Docker úteis

- Conferir os containers: `docker compose ps`
- Ver os logs do banco: `docker compose logs postgres`
- Parar os containers: `docker compose down`
- **Apagar os dados e reiniciar o laboratório:** execute `docker compose down -v` e depois `docker compose up -d`. Isso remove o volume PostgreSQL deste projeto.

## Observações

- A API é pequena e sem interface gráfica.
- Não existe envio de emails, upload, acesso a outros sistemas ou usuários reais.
- A atividade não autoriza testes em outras redes, serviços ou aplicações.
