import { useEffect, useMemo, useState } from 'react';
import { fetchAdminPedidos, updatePedidoStatus } from '../services/adminPedidoService';

const STATUS_OPTIONS = [
  { value: 'PEDIDO_FEITO', label: 'Pedido feito' },
  { value: 'PEDIDO_EM_PREPARO', label: 'Em preparo' },
  { value: 'PEDIDO_EM_ROTA_DE_ENTREGA', label: 'Em rota' },
  { value: 'PEDIDO_ENTREGUE', label: 'Entregue' },
];

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('pt-BR');
}

function formatAddress(address) {
  if (!address) return 'Nenhum endereço cadastrado';
  return [
    address.street,
    address.number,
    address.neighborhood,
    address.city,
    address.state,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(', ');
}

function statusLabel(status) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function AdminOrdersPage() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const openOrders = useMemo(
    () => pedidos.filter((pedido) => pedido.status !== 'PEDIDO_ENTREGUE').length,
    [pedidos]
  );

  async function loadPedidos() {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const data = await fetchAdminPedidos();
      setPedidos(data ?? []);
      setSelectedPedido((current) => {
        if (!current) return null;
        return data?.find((pedido) => pedido.id === current.id) ?? null;
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPedidos();
  }, []);

  async function handleStatusChange(pedido, nextStatus) {
    setUpdatingId(pedido.id);
    setStatus({ type: '', message: '' });
    const previousStatus = pedido.status;

    setPedidos((current) =>
      current.map((item) => (item.id === pedido.id ? { ...item, status: nextStatus } : item))
    );
    setSelectedPedido((current) => (
      current?.id === pedido.id ? { ...current, status: nextStatus } : current
    ));

    try {
      const updatedPedido = await updatePedidoStatus(pedido.id, nextStatus);
      setPedidos((current) =>
        current.map((item) => (item.id === updatedPedido.id ? updatedPedido : item))
      );
      setSelectedPedido((current) => (current?.id === updatedPedido.id ? updatedPedido : current));
      setStatus({ type: 'success', message: 'Status atualizado com sucesso.' });
    } catch (error) {
      setPedidos((current) =>
        current.map((item) => (item.id === pedido.id ? { ...item, status: previousStatus } : item))
      );
      setSelectedPedido((current) => (
        current?.id === pedido.id ? { ...current, status: previousStatus } : current
      ));
      setStatus({ type: 'error', message: error.message });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <p className="eyebrow">Painel interno</p>
          <h2>Pedidos</h2>
        </div>

        <div className="admin-stats">
          <div>
            <strong>{pedidos.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{openOrders}</strong>
            <span>Abertos</span>
          </div>
        </div>
      </div>

      {status.message ? (
        <p className={status.type === 'success' ? 'status-message success' : 'status-message error'}>
          {status.message}
        </p>
      ) : null}

      <div className="admin-users-layout admin-orders-layout">
        <div className="admin-users-table-wrap">
          {isLoading ? (
            <p className="muted-message table-loading">Carregando pedidos...</p>
          ) : (
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>{pedido.codigo}</td>
                    <td>{pedido.userName || 'Usuario removido'}</td>
                    <td>{formatCurrency(pedido.precoTotal)}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={pedido.status}
                        disabled={updatingId === pedido.id}
                        onChange={(event) => handleStatusChange(pedido, event.target.value)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" onClick={() => setSelectedPedido(pedido)}>
                          Ver detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="admin-user-detail">
          <p className="eyebrow">Detalhes</p>
          {selectedPedido ? (
            <>
              <h3>{selectedPedido.codigo}</h3>
              <dl>
                <div>
                  <dt>Cliente</dt>
                  <dd>{selectedPedido.userName || 'Usuario removido'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedPedido.userEmail || '-'}</dd>
                </div>
                <div>
                  <dt>Criado em</dt>
                  <dd>{formatDate(selectedPedido.criadoEm)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{statusLabel(selectedPedido.status)}</dd>
                </div>
                <div>
                  <dt>Produtos</dt>
                  <dd>{formatCurrency(selectedPedido.subtotalProdutos ?? selectedPedido.precoTotal)}</dd>
                </div>
                <div>
                  <dt>Frete</dt>
                  <dd>
                    {formatCurrency(selectedPedido.frete)}
                    {selectedPedido.distanciaEntregaKm
                      ? ` (${Number(selectedPedido.distanciaEntregaKm).toFixed(1).replace('.', ',')} km)`
                      : ''}
                  </dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatCurrency(selectedPedido.precoTotal)}</dd>
                </div>
                <div>
                  <dt>Itens</dt>
                  <dd>
                    {(selectedPedido.itens ?? []).map((item) => item.nome).join(', ') || '-'}
                  </dd>
                </div>
              </dl>

              <div className="order-detail-section">
                <p className="section-title">Endereço de entrega</p>
                <p className="order-address">
                  {formatAddress(selectedPedido.enderecoEntrega)}
                </p>
              </div>

              <div className="order-detail-section">
                <p className="section-title">Itens do pedido</p>
                <div className="order-items-grid">
                  {(selectedPedido.itens ?? []).map((item) => (
                    <article key={item.id} className="order-item-card">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.nome} />
                      ) : (
                        <div className="order-item-placeholder">Sem imagem</div>
                      )}
                      <div>
                        <strong>{item.nome}</strong>
                        <span>{formatCurrency(item.preco)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="muted-message">Selecione um pedido para verificar os dados.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default AdminOrdersPage;
