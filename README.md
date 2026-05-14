# Sabor do Campo

O Sabor do Campo é um sistema de delivery com cardápio digital, carrinho, autenticação de usuários, fluxo de pedidos e painel administrativo.

A proposta do sistema é oferecer uma experiência simples para o cliente escolher produtos, montar o carrinho, finalizar o pedido e acompanhar o status da entrega. Para a administração, o sistema permite cadastrar produtos, visualizar usuários, verificar pedidos de todos os clientes e atualizar o status de cada pedido.

---

## Integrantes

- Ane Madjarian Viana - PO
- Fábio Garcia Martins - Desenvolvedor
- Lucas Lopes Freitas Moura - Desenvolvedor
- Marcos Vinícius Nunes Reis - Desenvolvedor
- Tatielle Fernandes Dias - Product Designer

---

## Funcionalidades

- Cadastro e login de usuários com autenticação por JWT.
- Cardápio público com filtro por categoria e busca por produto.
- Carrinho protegido: somente usuários logados conseguem adicionar itens.
- Finalização de pedido a partir do carrinho.
- Tela de status do pedido com etapas e produtos comprados.
- Perfil do usuário com edição de dados e endereço.
- Busca automática de endereço por CEP via ViaCEP.
- Painel administrativo com acesso restrito.
- Cadastro de produtos disponível somente para admin.
- Listagem, visualização e exclusão de usuários pelo admin.
- Listagem de pedidos de todos os usuários pelo admin.
- Atualização do status dos pedidos pelo admin.

---

## Estrutura

- `frontend`: interface React/Vite do sistema.
- `backend-spring`: API Spring Boot com JPA, Spring Security, JWT e persistência em MySQL.
- `backend`: atalho de execução para subir o backend Spring Boot.

---

## Tecnologias

### Backend

- Java
- Spring Boot 3.5.6
- Spring Web
- Spring Security
- Spring Data JPA
- MySQL Connector
- Maven Wrapper
- JWT

### Frontend

- React 18
- Vite
- Material UI
- CSS

---

## MySQL local configurado

Servidor local esperado:

- serviço: `MySQL80`
- porta: `3306`
- banco: `sabor_do_campo`
- usuário: `root`
- senha: `sabor-do-campo`

As configurações também podem ser alteradas por variáveis de ambiente:

- `MYSQL_URL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Para banco hospedado, use preferencialmente `MYSQL_URL` quando o provedor entregar
uma URL JDBC completa ou exigir parÃ¢metros extras, como SSL.

---

## Usuário administrador

Ao subir a aplicação, o sistema cria um usuário administrador padrão caso ele ainda não exista.

- email: `admin@sabordocampo.com`
- senha: `admin123`

Esses valores podem ser alterados por variáveis de ambiente:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

O administrador tem permissão para cadastrar produtos, visualizar usuários, excluir usuários e gerenciar pedidos.

---

## Como rodar o backend

Opção 1, pela pasta `backend`:

```powershell
cd ...\Sabor-do-Campo\backend
.\run.ps1
```

Opção 2, direto pelo Spring Boot:

```powershell
cd ...\Sabor-do-Campo\backend-spring
.\mvnw.cmd spring-boot:run
```

A API sobe em:

```text
http://localhost:8080
```

---

## Como rodar o frontend

```powershell
cd ...\Sabor-do-Campo\frontend
npm install
npm run dev
```

O frontend abre em:

```text
http://localhost:5173
```

---

## Como testar o build

Backend:

```powershell
cd ...\Sabor-do-Campo\backend-spring
.\mvnw.cmd test
```

Frontend:

```powershell
cd ...\Sabor-do-Campo\frontend
npm run build
```

---

## Endpoints da API

### Saúde

- `GET /api/health`

### Autenticação

- `POST /api/auth/login`

### Usuários

- `POST /api/users` - cria uma conta.
- `GET /api/users/me` - retorna o usuário logado.
- `PUT /api/users/me` - atualiza o perfil do usuário logado.
- `DELETE /api/users/me` - remove o usuário logado.
- `GET /api/users` - lista usuários, somente admin.
- `GET /api/users/{id}` - busca usuário por id, somente admin.
- `DELETE /api/users/{id}` - remove usuário por id, somente admin.

### Cardápio e categorias

- `GET /api/categories`
- `GET /api/menu-items`
- `GET /api/menu-items?category=ENTRADA`
- `POST /api/menu-items` - cadastra produto, somente admin.

### Carrinho

- `GET /api/carts/me`
- `POST /api/carts/me/items`
- `PUT /api/carts/me/items/{itemId}`
- `DELETE /api/carts/me/items/{itemId}`
- `DELETE /api/carts/me`
- `POST /api/carts/{cartId}/confirmar-pedido` - cria o pedido a partir do carrinho.

### Pedidos do usuário

- `GET /api/pedidos/me` - lista pedidos do usuário logado.
- `GET /api/pedidos/me/ativo` - retorna o pedido ativo do usuário logado.
- `GET /api/pedidos/{pedidoId}/status` - retorna o status atual do pedido.
- `POST /api/pedidos/{pedidoId}/confirmar-entrega` - marca o pedido como entregue.

### Pedidos do admin

- `GET /api/admin/pedidos` - lista todos os pedidos.
- `PUT /api/admin/pedidos/{pedidoId}/status` - altera o status de um pedido.

---

## Observações

- O cardápio pode ser visualizado sem login.
- Para adicionar itens ao carrinho, é obrigatório estar logado.
- A tela de pedidos do cliente mostra apenas os pedidos do próprio usuário.
- A tela administrativa de pedidos mostra os pedidos de todos os usuários.
- O logout redireciona o usuário para a página inicial.
