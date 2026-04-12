# Sabor do Campo

O Sabor do Campo é um sistema de delivery que permite aos usuários visualizar um cardápio digital de forma prática e organizada, facilitando a escolha de produtos e a realização de pedidos.  
A proposta do sistema é oferecer uma experiência simples e intuitiva, onde o cliente pode navegar pelas categorias, selecionar itens e acompanhar o valor total da compra antes de finalizar o pedido.  

---

## Integrantes  
- Ane Madjarian Viana - PO
- Fábio Garcia Martins - Desenvlvedor 
- Lucas Lopes Freitas Moura - Desenvolvedor
- Marcos Vinícius Nunes Reis - Desenvolvedor
- Tatielle Fernandes Dias - Product Designer

---

## Estrutura

- `frontend`: interface React para visualizar os produtos
- `backend-spring`: API Spring Boot com JPA e persistencia em MySQL
- `backend`: atalho de execucao para subir o novo backend Spring Boot

## Tecnologias do backend

- Spring Boot 3.5.6
- Spring Web
- Spring Data JPA
- MySQL Connector
- Maven Wrapper

## MySQL local configurado

Servidor detectado localmente:

- servico: `MySQL80`
- porta: `3306`
- banco criado: `sabor_do_campo`
- usuario: `root`
- senha: `sabor-do-campo`

## Como rodar o backend

Opcao 1, pela pasta `backend`:

```powershell
cd ...\Sabor-do-Campo\backend
.\run.ps1
```

Opcao 2, direto pelo Spring Boot:

```powershell
cd ...\Sabor-do-Campo\backend-spring
.\mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`.

## Como rodar o frontend

```powershell
cd ...\Sabor-do-Campo\frontend
npm install
npm run dev
```

O frontend abre em `http://localhost:5173`.

## Endpoints da API

- `GET /api/health`
- `GET /api/categories`
- `GET /api/menu-items`
- `GET /api/menu-items?category=ENTRADA`
- `POST /api/menu-items`




