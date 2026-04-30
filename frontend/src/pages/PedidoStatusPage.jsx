import { useEffect, useMemo, useState } from 'react';
import { buscarStatusPedido, confirmarEntregaPedido } from '../services/pedidoService';

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

function PedidoStatusPage({ pedido, onBackToMenu, onStatusChange }) {
  const [status, setStatus] = useState(pedido?.status ?? 'PEDIDO_FEITO');
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

  useEffect(() => {
    setStatus(pedido?.status ?? 'PEDIDO_FEITO');
  }, [pedido?.id, pedido?.status]);

  useEffect(() => {
    if (!pedido?.id) return;

    let intervalId;
    let isMounted = true;

    async function loadStatus() {
      try {
        const response = await buscarStatusPedido(pedido.id);
        if (!isMounted) return;
        setStatus(response.status);
      } catch (err) {
        console.error(err);
      }
    }

    loadStatus();
    intervalId = window.setInterval(loadStatus, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [pedido?.id]);

  useEffect(() => {
    if (!pedido?.id || !onStatusChange) return;
    onStatusChange(status);
  }, [pedido?.id, status, onStatusChange]);

  const currentStep = useMemo(() => STATUS_FLOW.indexOf(status), [status]);
  const safeStep = currentStep < 0 ? 0 : currentStep;
  const progressPercent = Math.round((safeStep / (STATUS_FLOW.length - 1)) * 100);
  const canConfirmDelivery = status === 'PEDIDO_EM_ROTA_DE_ENTREGA';

  async function handleConfirmDelivery() {
    if (!pedido?.id) return;

    try {
      setIsConfirmingDelivery(true);
      const response = await confirmarEntregaPedido(pedido.id);
      setStatus(response.status);
    } catch (err) {
      alert(err.message || 'Nao foi possivel confirmar entrega.');
    } finally {
      setIsConfirmingDelivery(false);
    }
  }

  if (!pedido?.id) {
    return (
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Nenhum pedido ativo</h2>
          <button className="edit-address-button" onClick={onBackToMenu}>
            Voltar ao cardapio
          </button>
        </div>
      </section>
    );
  }

  return (
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Status do pedido</h2>
          <p className="pedido-code">Codigo: {pedido.codigo}</p>
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

            <button className="edit-address-button" onClick={onBackToMenu}>
              Voltar ao cardapio
            </button>
          </div>
        </div>
      </section>
  );
}

export default PedidoStatusPage;
