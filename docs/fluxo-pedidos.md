# Fluxo de Pedidos - Sabor do Campo

Este documento explica o fluxo de pedidos do sistema Sabor do Campo, desde a confirmacao do carrinho pelo cliente ate a visualizacao e alteracao de status pelo administrador.

## Visao geral

O pedido nasce a partir do carrinho do usuario logado. Quando o cliente confirma a compra, o backend copia os dados atuais do carrinho para uma entidade `Pedido`, salva esse pedido no banco de dados e esvazia os itens do carrinho.

Depois disso, o cliente consegue acompanhar seus pedidos pela aba `Pedidos`, enquanto o administrador consegue ver todos os pedidos na aba administrativa e alterar o status.

Fluxo resumido:

```mermaid
flowchart TD
    A[Cliente logado adiciona itens ao carrinho] --> B[Cliente informa endereco]
    B --> C[Cliente confirma pedido]
    C --> D[Frontend chama POST /api/carts/{cartId}/confirmar-pedido]
    D --> E[PedidoService valida carrinho, usuario, itens e endereco]
    E --> F[Backend cria Pedido e PedidoItem]
    F --> G[PedidoRepository salva no banco]
    G --> H[Carrinho e esvaziado]
    H --> I[Cliente acompanha em /api/pedidos/me]
    G --> J[Admin consulta /api/admin/pedidos]
    J --> K[Admin altera status em PUT /api/admin/pedidos/{id}/status]
```

## Regras principais

- O pedido pertence a um usuario, salvo no campo `user` da entidade `Pedido`.
- O pedido e salvo no banco na tabela `pedidos`.
- Os produtos do pedido sao salvos na tabela `pedido_itens`.
- O pedido guarda uma copia dos dados do produto no momento da compra, como nome, preco e imagem.
- O pedido guarda uma copia do endereco de entrega do carrinho.
- O status inicial sempre e `PEDIDO_FEITO`.
- O status nao muda automaticamente por timer.
- O admin altera o status manualmente.
- A tela do usuario mostra apenas pedidos que ainda nao foram entregues.
- Pedidos entregues continuam no banco e continuam aparecendo para o admin.

## Status do pedido

Os status ficam definidos no enum:

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/domain/PedidoStatus.java`

Status existentes:

- `PEDIDO_FEITO`: pedido criado e recebido pelo sistema.
- `PEDIDO_EM_PREPARO`: pedido esta sendo preparado.
- `PEDIDO_EM_ROTA_DE_ENTREGA`: pedido saiu para entrega.
- `PEDIDO_ENTREGUE`: pedido finalizado.

O status e persistido no banco dentro da entidade `Pedido`.

## Backend

### Domain

#### Pedido

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/domain/Pedido.java`

Responsabilidade:

- Representa o pedido salvo no banco.
- Mapeia a tabela `pedidos`.
- Guarda codigo, data de criacao, endereco, status, usuario dono e itens.
- Calcula o total do pedido somando os itens.

Campos importantes:

- `id`: identificador do pedido.
- `codigo`: codigo publico do pedido, exemplo `PED-ABC12345`.
- `criadoEm`: data e hora em que o pedido foi criado.
- `enderecoEntrega`: copia do endereco informado no carrinho.
- `entregueEm`: data de entrega, preenchida quando o pedido vira `PEDIDO_ENTREGUE`.
- `status`: status atual do pedido.
- `user`: usuario dono do pedido.
- `itens`: lista de produtos comprados.

Ponto importante:

O metodo `setStatus` tambem controla `entregueEm`. Se o status vira `PEDIDO_ENTREGUE`, ele preenche a data de entrega. Se o status deixa de ser entregue, ele limpa essa data.

#### PedidoItem

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/domain/PedidoItem.java`

Responsabilidade:

- Representa cada produto dentro de um pedido.
- Mapeia a tabela `pedido_itens`.
- Guarda uma copia do produto comprado.

Campos importantes:

- `pedido`: pedido ao qual o item pertence.
- `menuItemId`: id do produto original do cardapio.
- `nome`: nome do produto no momento da compra.
- `preco`: preco do produto no momento da compra.
- `imageUrl`: imagem do produto.

Essa copia e importante porque, se o admin deletar ou alterar um produto depois, o pedido antigo continua mantendo o nome e preco que foram comprados.

### DTOs

DTOs sao objetos usados para entrada e saida da API. Eles evitam expor diretamente as entidades do banco.

#### PedidoResponse

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoResponse.java`

Responsabilidade:

- Retorna os dados completos de um pedido para o frontend.

Campos:

- `id`
- `codigo`
- `criadoEm`
- `status`
- `itens`
- `enderecoEntrega`
- `precoTotal`
- `userId`
- `userName`
- `userEmail`

Esse DTO e usado tanto na tela do usuario quanto na tela do admin.

#### PedidoItemResponse

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoItemResponse.java`

Responsabilidade:

- Retorna os dados de cada item do pedido.

Campos:

- `id`
- `menuItemId`
- `nome`
- `preco`
- `imageUrl`

#### PedidoStatusRequest

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoStatusRequest.java`

Responsabilidade:

- Recebe o novo status enviado pelo admin.

Exemplo de corpo da requisicao:

```json
{
  "status": "PEDIDO_EM_ROTA_DE_ENTREGA"
}
```

#### PedidoStatusResponse

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoStatusResponse.java`

Responsabilidade:

- Retorna apenas as informacoes de status de um pedido.

Campos:

- `pedidoId`
- `codigo`
- `status`

### Repository

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/repository/PedidoRepository.java`

Responsabilidade:

- Faz o acesso ao banco de dados usando Spring Data JPA.
- Permite salvar, buscar e listar pedidos.

Metodos importantes:

- `existsByCodigo(String codigo)`: verifica se um codigo de pedido ja existe.
- `findByIdAndUserEmail(Long id, String email)`: busca um pedido especifico pertencente ao usuario logado.
- `findByUserEmail(String email)`: busca pedidos pelo email do usuario.
- `findByUserEmailOrderByCriadoEmDesc(String email)`: lista pedidos do usuario do mais recente para o mais antigo.
- `findAllByOrderByCriadoEmDesc()`: lista todos os pedidos para o admin, do mais recente para o mais antigo.

### Service

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/service/PedidoService.java`

Responsabilidade:

- Contem a regra de negocio de pedidos.
- Cria pedido a partir do carrinho.
- Valida usuario, carrinho, itens e endereco.
- Lista pedidos do usuario.
- Lista pedidos para o admin.
- Atualiza status.

#### Criacao do pedido

Metodo:

- `criarAPartirDoCarrinho(Long cartId, String email)`

Fluxo:

1. Busca o carrinho pelo id.
2. Confere se o carrinho pertence ao usuario logado.
3. Bloqueia pedido com carrinho vazio.
4. Bloqueia pedido sem endereco de entrega.
5. Cria um novo `Pedido`.
6. Define codigo unico.
7. Define data de criacao.
8. Copia o endereco do carrinho.
9. Vincula o pedido ao usuario.
10. Define status inicial `PEDIDO_FEITO`.
11. Copia cada item do carrinho para `PedidoItem`.
12. Salva o pedido com `pedidoRepository.save(pedido)`.
13. Limpa os itens do carrinho.
14. Retorna `PedidoResponse`.

Ponto para apresentar:

O pedido realmente e salvo no banco. O ponto central e:

```java
Pedido savedPedido = pedidoRepository.save(pedido);
```

#### Listagem do usuario

Metodo:

- `listarMeusPedidos(String email)`

Fluxo:

1. Busca todos os pedidos vinculados ao email do usuario.
2. Ordena do mais recente para o mais antigo.
3. Converte cada entidade para `PedidoResponse`.

Esse metodo alimenta a aba `Pedidos` do usuario.

#### Listagem do admin

Metodo:

- `listarTodos()`

Fluxo:

1. Busca todos os pedidos do banco.
2. Ordena do mais recente para o mais antigo.
3. Converte cada pedido para `PedidoResponse`.

Esse metodo alimenta a tela administrativa de pedidos.

#### Atualizacao de status pelo admin

Metodo:

- `atualizarStatus(Long pedidoId, PedidoStatusRequest request)`

Fluxo:

1. Valida se o status foi enviado.
2. Busca o pedido pelo id.
3. Chama `pedido.setStatus(request.status())`.
4. Retorna o pedido atualizado.

Como o metodo esta em uma transacao (`@Transactional`), o JPA persiste a mudanca no banco.

### Controller

Arquivo:

- `backend-spring/src/main/java/com/sabordocampo/pedido/web/PedidoController.java`

Responsabilidade:

- Expor os endpoints HTTP de pedidos.
- Receber as requisicoes do frontend.
- Chamar os metodos do `PedidoService`.

Endpoints principais:

- `POST /api/carts/{cartId}/confirmar-pedido`
  - Cria o pedido a partir do carrinho do usuario logado.

- `GET /api/pedidos/me`
  - Lista os pedidos do usuario logado.

- `GET /api/pedidos/me/ativos`
  - Lista apenas pedidos nao entregues do usuario.

- `GET /api/pedidos/{pedidoId}/status`
  - Busca o status de um pedido especifico do usuario.

- `POST /api/pedidos/{pedidoId}/confirmar-entrega`
  - Permite o usuario confirmar entrega quando o pedido esta em rota.

- `GET /api/admin/pedidos`
  - Lista todos os pedidos para o admin.

- `PUT /api/admin/pedidos/{pedidoId}/status`
  - Permite o admin alterar o status de um pedido.

## Frontend

### Servicos de pedido

#### pedidoService

Arquivo:

- `frontend/src/services/pedidoService.js`

Responsabilidade:

- Centraliza as chamadas de pedido feitas pelo usuario comum.

Funcoes:

- `confirmarPedido(cartId)`: chama `POST /api/carts/{cartId}/confirmar-pedido`.
- `buscarStatusPedido(pedidoId)`: chama `GET /api/pedidos/{pedidoId}/status`.
- `buscarPedidoAtivo()`: chama `GET /api/pedidos/me/ativo`.
- `buscarPedidosAtivos()`: chama `GET /api/pedidos/me/ativos`.
- `listarMeusPedidos()`: chama `GET /api/pedidos/me`.
- `confirmarEntregaPedido(pedidoId)`: chama `POST /api/pedidos/{pedidoId}/confirmar-entrega`.

#### adminPedidoService

Arquivo:

- `frontend/src/services/adminPedidoService.js`

Responsabilidade:

- Centraliza as chamadas administrativas de pedidos.

Funcoes:

- `fetchAdminPedidos()`: chama `GET /api/admin/pedidos`.
- `updatePedidoStatus(pedidoId, status)`: chama `PUT /api/admin/pedidos/{pedidoId}/status`.

### App

Arquivo:

- `frontend/src/App.jsx`

Responsabilidade no fluxo:

- Mantem o usuario logado.
- Mantem o carrinho.
- Busca os pedidos do usuario no banco.
- Controla a navegacao entre `Cardapio`, `Carrinho`, `Pedidos`, `Produtos`, `Usuarios` e area admin.
- Ao confirmar pedido, chama `confirmarPedido(cart.id)`.
- Atualiza a lista de pedidos do usuario apos a criacao.

Pontos importantes:

- A aba `Pedidos` aparece para usuario logado comum.
- A aba `Pedidos` do usuario busca pedidos do banco usando `listarMeusPedidos()`.
- Pedidos com status `PEDIDO_ENTREGUE` sao filtrados fora da aba do cliente.
- O admin continua vendo todos os pedidos.

### Tela de status do usuario

Arquivo:

- `frontend/src/pages/PedidoStatusPage.jsx`

Responsabilidade:

- Mostra os pedidos do usuario.
- Permite alternar entre mais de um pedido em andamento.
- Mostra a etapa atual e a barra de progresso.
- Mostra os produtos do pedido.
- Permite confirmar entrega quando o status esta `PEDIDO_EM_ROTA_DE_ENTREGA`.

Ponto importante:

Essa tela nao possui timer automatico de troca de status. Ela mostra o status vindo do backend. O status so muda quando:

- o admin altera na tela administrativa;
- o usuario confirma entrega;
- a pagina e recarregada e os dados sao buscados novamente do banco.

### Tela administrativa de pedidos

Arquivo:

- `frontend/src/pages/AdminOrdersPage.jsx`

Responsabilidade:

- Lista todos os pedidos.
- Mostra total de pedidos e quantidade de pedidos abertos.
- Permite selecionar um pedido para ver detalhes.
- Permite alterar o status usando um `select`.

Fluxo de alteracao:

1. Admin seleciona um novo status.
2. Frontend atualiza visualmente o status na hora.
3. Frontend chama `PUT /api/admin/pedidos/{pedidoId}/status`.
4. Backend salva o novo status no banco.
5. Frontend substitui o pedido antigo pelo pedido retornado pela API.
6. Se der erro, o frontend volta para o status anterior.

## Fluxo detalhado de criacao

1. Cliente acessa o cardapio.
2. Cliente adiciona produtos ao carrinho.
3. Cliente informa endereco.
4. Cliente confirma pedido.
5. `ShoppingCartPage` chama `onConfirmarPedido`.
6. `App.jsx` executa `handleConfirmarPedido`.
7. `handleConfirmarPedido` chama `confirmarPedido(cart.id)`.
8. `pedidoService.js` envia `POST /api/carts/{cartId}/confirmar-pedido`.
9. `PedidoController` recebe a requisicao.
10. `PedidoService.criarAPartirDoCarrinho` cria e salva o pedido.
11. `PedidoRepository.save` persiste no banco.
12. Backend retorna `PedidoResponse`.
13. Frontend mostra a tela `Pedidos`.

## Fluxo detalhado de status

1. O pedido nasce com `PEDIDO_FEITO`.
2. O admin acessa `Pedidos` no painel interno.
3. A tela `AdminOrdersPage` busca todos os pedidos.
4. O admin altera o status pelo select.
5. `adminPedidoService.updatePedidoStatus` chama o endpoint do backend.
6. `PedidoController.atualizarStatus` recebe a requisicao.
7. `PedidoService.atualizarStatus` busca o pedido e chama `setStatus`.
8. O banco fica atualizado.
9. Quando o cliente abre ou recarrega a aba `Pedidos`, o frontend busca os dados atualizados do banco.

## Arquivos do fluxo de pedidos

Backend:

- `backend-spring/src/main/java/com/sabordocampo/pedido/domain/Pedido.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/domain/PedidoItem.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/domain/PedidoStatus.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoResponse.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoItemResponse.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoStatusRequest.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/dto/PedidoStatusResponse.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/repository/PedidoRepository.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/service/PedidoService.java`
- `backend-spring/src/main/java/com/sabordocampo/pedido/web/PedidoController.java`

Frontend:

- `frontend/src/services/pedidoService.js`
- `frontend/src/services/adminPedidoService.js`
- `frontend/src/pages/PedidoStatusPage.jsx`
- `frontend/src/pages/AdminOrdersPage.jsx`
- `frontend/src/pages/ShoppingCartPage.jsx`
- `frontend/src/App.jsx`

Arquivos relacionados:

- `backend-spring/src/main/java/com/sabordocampo/cart/domain/ShoppingCart.java`
- `backend-spring/src/main/java/com/sabordocampo/cart/domain/CartItem.java`
- `backend-spring/src/main/java/com/sabordocampo/cart/repository/ShoppingCartRepository.java`
- `frontend/src/services/cartService.js`

## Resumo para apresentacao

O fluxo de pedidos foi separado em camadas:

- `Domain`: representa as tabelas e regras basicas da entidade.
- `DTO`: define os dados que entram e saem da API.
- `Repository`: conversa com o banco de dados.
- `Service`: concentra a regra de negocio.
- `Controller`: expõe os endpoints HTTP.
- `Frontend services`: fazem as chamadas para a API.
- `Frontend pages`: mostram e manipulam os dados para cliente e admin.

O pedido e criado a partir do carrinho, salvo no banco, vinculado ao usuario e acompanhado por status. O cliente acompanha seus pedidos na aba `Pedidos`, enquanto o admin visualiza todos os pedidos e controla manualmente o status.
