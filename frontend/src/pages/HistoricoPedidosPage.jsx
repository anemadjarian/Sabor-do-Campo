import { useEffect, useState } from 'react';
import { listarMeusPedidos } from '../services/pedidoService';

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

function HistoricoPedidosPage({ onBack }) {

  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    async function carregar() {
      try {
        const data = await listarMeusPedidos();
        setPedidos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    carregar();

  }, []);

  if (isLoading) {
    return (
      <section className="hero-card">
        <h2>Carregando histórico...</h2>
      </section>
    );
  }

  return (
    <section className="hero-card">

      <div className="hero-copy">
        <h2>Histórico de pedidos</h2>
      </div>

      <div className="menu-panel">

        {pedidos.length === 0 ? (
          <p>Você ainda não possui pedidos concluídos.</p>
        ) : (
          <div className="pedido-history-list">

            {pedidos.map((pedido) => (

                <div className="pedido-history-card" key={pedido.id}>

                <div className="pedido-history-header">
                    <div>
                    <strong>{pedido.codigo}</strong>
                    <p>
                        {new Date(pedido.criadoEm).toLocaleString('pt-BR')}
                    </p>
                    </div>

                    <span className="order-status-chip">
                    {STATUS_LABEL[pedido.status]}
                    </span>
                </div>

                <div className="status-progress-track">
                    <div
                    className="status-progress-fill"
                    style={{
                        width: `${(
                        STATUS_FLOW.indexOf(pedido.status) /
                        (STATUS_FLOW.length - 1)
                        ) * 100}%`
                    }}
                    />
                </div>

                <div className="pedido-products-list">
                    {pedido.itens.map((item) => (
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

                <div className="pedido-history-footer">
                    <div>
                    <p>
                        Produtos: {formatCurrency(pedido.subtotalProdutos)}
                    </p>

                    <p>
                        Frete: {formatCurrency(pedido.frete)}
                    </p>
                    </div>

                    <strong>
                    {formatCurrency(pedido.precoTotal)}
                    </strong>
                </div>

                </div>

            ))}

          </div>
        )}

        <button
          className="edit-address-button"
          onClick={onBack}
        >
          Voltar
        </button>

      </div>

    </section>
  );
}

export default HistoricoPedidosPage;