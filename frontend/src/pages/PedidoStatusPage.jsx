import { useMemo, useState } from 'react';
import { confirmarEntregaPedido } from '../services/pedidoService';

const STATUS_FLOW = [
  'PEDIDO_FEITO',
  'PEDIDO_EM_PREPARO',
  'PEDIDO_EM_ROTA_DE_ENTREGA',
  'PEDIDO_ENTREGUE',
];

const STATUS_LABEL = {
  PEDIDO_FEITO: 'Pedido feito',
  PEDIDO_EM_PREPARO: 'Pedido em preparo',
  PEDIDO_EM_ROTA_DE_ENTREGA: 'Pedido em rota de entrega',
  PEDIDO_ENTREGUE: 'Pedido entregue',
};

const STATUS_DESCRIPTION = {
  PEDIDO_FEITO: 'Recebemos seu pedido e ja estamos organizando.',
  PEDIDO_EM_PREPARO: 'Sua refeicao esta sendo preparada.',
  PEDIDO_EM_ROTA_DE_ENTREGA: 'Nosso entregador esta a caminho do seu endereco.',
  PEDIDO_ENTREGUE: 'Pedido finalizado com sucesso.',
};

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function PedidoStatusPage({ pedido, isLoading = false, onBackToMenu, onStatusChange, onOpenHistorico }) {
  const currentPedido = pedido;
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const status = currentPedido?.status ?? 'PEDIDO_FEITO';

  const currentStep = useMemo(() => STATUS_FLOW.indexOf(status), [status]);
  const safeStep = currentStep < 0 ? 0 : currentStep;
  const progressPercent = Math.round((safeStep / (STATUS_FLOW.length - 1)) * 100);
  const canConfirmDelivery = status === 'PEDIDO_EM_ROTA_DE_ENTREGA';

  async function handleConfirmDelivery() {
    if (!currentPedido?.id) return;

    try {
      setIsConfirmingDelivery(true);
      const response = await confirmarEntregaPedido(currentPedido.id);
      onStatusChange?.(currentPedido.id, response.status);
    } catch (err) {
      alert(err.message || 'Nao foi possivel confirmar entrega.');
    } finally {
      setIsConfirmingDelivery(false);
    }
  }

  if (isLoading && !currentPedido?.id) {
    return (
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Carregando pedidos</h2>
          <p>Buscando seus pedidos no banco de dados.</p>
        </div>
      </section>
    );
  }

  if (!currentPedido?.id) {
    return (
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Nenhum pedido encontrado</h2>
          <p>Quando você fizer um pedido, ele aparecerá aqui.</p>
          <button className="edit-address-button" onClick={onOpenHistorico}>
            Ver histórico
          </button>
          <button className="edit-address-button" onClick={onBackToMenu}>
            Voltar ao cardápio
          </button>
        </div>
      </section>
    );
  }

  return (
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Status do pedido</h2>
          <p className="pedido-code">Codigo: {currentPedido.codigo}</p>
        </div>

        <div className="menu-panel">
          <div className="status-summary">
            <p className="status-summary-label">Etapa atual</p>
            <div className="status-summary-main">
              <strong>{STATUS_LABEL[status]}</strong>
              <span className="order-status-chip">{progressPercent}%</span>
            </div>
            <p className="status-summary-description">{STATUS_DESCRIPTION[status]}</p>
          </div>

          <div className="status-progress-track" aria-hidden="true">
            <div className="status-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="pedido-products">
            <div className="pedido-products-heading">
              <h3>Produtos do pedido</h3>
              <strong>{formatCurrency(currentPedido.precoTotal)}</strong>
            </div>
            <p className="shipping-note">
              Produtos: {formatCurrency(currentPedido.subtotalProdutos ?? currentPedido.precoTotal)}
              {' | '}
              Frete: {formatCurrency(currentPedido.frete)}
              {currentPedido.distanciaEntregaKm ? ` (${Number(currentPedido.distanciaEntregaKm).toFixed(1).replace('.', ',')} km estimados)` : ''}
            </p>

            <div className="pedido-products-list">
              {(currentPedido.itens ?? []).map((item) => (
                <div className="pedido-product-row" key={item.id}>
                  <div className="pedido-product-image-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.nome} />
                    ) : (
                      <span>Foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{item.nome}</strong>
                    <p>{formatCurrency(item.preco)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="status-list">
            {STATUS_FLOW.map((step, index) => {
              const stateClass =
                index < safeStep ? 'status-done' : index === safeStep ? 'status-current' : 'status-pending';

              return (
                <div key={step} className={`status-row ${stateClass}`}>
                  <div className="status-row-head">
                    <strong>{STATUS_LABEL[step]}</strong>
                    <span>{index < safeStep ? 'Concluido' : index === safeStep ? 'Atual' : 'Pendente'}</span>
                  </div>
                  <p>{STATUS_DESCRIPTION[step]}</p>
                </div>
              );
            })}
          </div>

          <div className="status-actions">
            {canConfirmDelivery ? (
              <button
                className="edit-address-button"
                onClick={handleConfirmDelivery}
                disabled={isConfirmingDelivery}
              >
                {isConfirmingDelivery ? 'Confirmando...' : 'Confirmar entrega'}
              </button>
            ) : null}
            <button
              className="edit-address-button"
              onClick={onOpenHistorico}
            >
              Ver histórico
            </button>
            <button className="edit-address-button" onClick={onBackToMenu}>
              Voltar ao cardápio
            </button>
          </div>
        </div>
      </section>
  );
}

export default PedidoStatusPage;
