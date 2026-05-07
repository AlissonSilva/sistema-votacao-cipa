# VotaCipa - Sistema de Votação CIPA

Sistema completo para gerenciamento de eleições CIPA (Comissão Interna de Prevenção de Acidentes), com backend em .NET 8 e frontend em Angular 17.

## Funcionalidades

- **Períodos Eleitorais**: Criar, editar e gerenciar períodos de votação
- **Candidatos**: Cadastro de candidatos vinculados a períodos eleitorais
- **Votação**: Interface intuitiva para votação com validação de matrícula única
- **Apuração**: Apuração parcial (durante votação) e final (encerramento)
- **Gestão de Usuários**: Controle de acesso com perfis Admin e Votação

## Tecnologias

### Backend
- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- SQLite (desenvolvimento) / SAP HANA (produção)
- JWT Authentication
- BCrypt para hash de senhas

### Frontend
- Angular 17
- Angular Material
- TypeScript
- SCSS

## Requisitos

- .NET 8 SDK
- Node.js 18+
- Angular CLI 17

## Como Executar

### Backend

```bash
cd backend/VotaCipa
dotnet run
```

A API estará disponível em `http://localhost:5000` com Swagger em `http://localhost:5000/swagger`.

### Frontend

```bash
cd frontend/vota-cipa
npm install
ng serve
```

O frontend estará disponível em `http://localhost:4200`.

## Credenciais Padrão

- **Matrícula**: admin
- **Senha**: admin123
- **Perfil**: Administrador (acesso completo)

## Perfis de Acesso

| Perfil | Permissões |
|--------|-----------|
| Admin | Períodos Eleitorais, Candidatos, Votação, Apuração, Usuários |
| Votação | Apenas tela de Votação |

## Estrutura do Projeto

```
sistema-votacao-cipa/
├── backend/
│   └── VotaCipa/           # ASP.NET Core Web API
│       ├── Controllers/    # Endpoints da API
│       ├── Models/         # Entidades do banco
│       ├── DTOs/           # Objetos de transferência
│       ├── Data/           # DbContext e configurações
│       ├── Services/       # Serviços (Token, etc)
│       └── Enums/          # Enumerações
└── frontend/
    └── vota-cipa/          # Angular 17 App
        └── src/app/
            ├── pages/      # Componentes de página
            ├── services/   # Serviços HTTP
            ├── guards/     # Guards de rota
            ├── models/     # Interfaces TypeScript
            └── components/ # Componentes compartilhados
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Autenticação |
| GET/POST | /api/users | Listar/Criar usuários |
| PUT/DELETE | /api/users/{id} | Atualizar/Desativar usuário |
| GET/POST | /api/electoralperiods | Listar/Criar períodos |
| PUT/DELETE | /api/electoralperiods/{id} | Atualizar/Excluir período |
| GET | /api/candidates/period/{id} | Candidatos por período |
| POST | /api/candidates | Criar candidato |
| POST | /api/voting | Registrar voto |
| GET | /api/voting/check/{periodId}/{registration} | Verificar se já votou |
| GET | /api/counting/partial/{periodId} | Apuração parcial |
| GET | /api/counting/final/{periodId} | Apuração final |

## Conexão com SAP HANA

Para usar SAP HANA em produção, instale o pacote NuGet `Sap.Data.Hana.Core.v2.1` e altere a connection string em `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=<host>:30015;Database=<database>;UserName=<user>;Password=<password>"
  }
}
```
