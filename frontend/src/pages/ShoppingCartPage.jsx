import { useState } from 'react';
import AddressModal from '../components/AddressModal';
import CartItemCard from '../components/CartItemCard';
import { updateCartAddress } from '../services/cartService';
import { calculateDeliveryFee } from '../services/shippingService';
import { notifyError } from '../services/notificationService';

function ShoppingCartPage({
  items,
  address,
  isLoggedIn,
  onRequireLogin,
  onAddressUpdate,
  onRemoveItem,
  onConfirmarPedido
}) {

  const [showModal, setShowModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const shipping = calculateDeliveryFee(address);
  const total = subtotal + shipping.price;

  async function handleSaveAddress(newAddress) {
    if (!isLoggedIn) {
      notifyError('Voce precisa estar logado para cadastrar endereco.');
      onRequireLogin?.();
      return;
    }

    await updateCartAddress(newAddress)
    onAddressUpdate(newAddress);
    setShowModal(false);
  }

  async function handleConfirmarPedido() {
    if (!isLoggedIn) {
      notifyError('Voce precisa estar logado para confirmar o pedido.');
      onRequireLogin?.();
      return;
    }

    if (
      !address ||
      !address.street ||
      !address.number ||
      !address.neighborhood ||
      !address.city ||
      !address.state
    ) {
      notifyError('Informe o endereco de entrega antes de confirmar o pedido.');
      return;
    }

    try {
      setIsConfirming(true);
      await onConfirmarPedido();
    } catch (err) {
      notifyError(err.message || 'Nao foi possivel confirmar o pedido.');
    } finally {
      setIsConfirming(false);
    }
  }

  function formatAddress(address) {
    if (
      !address ||
      !address.street ||
      !address.number ||
      !address.neighborhood ||
      !address.city ||
      !address.state
    ) {
      return 'Nenhum endereço cadastrado';
    }

    return `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city} - ${address.state}`;
  }

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <h2>Seu Carrinho</h2>
        <div className="address-section">
          <p className="address-label">Endereço de entrega</p>
          <p className="address-text">{formatAddress(address)}</p>
          <button className="edit-address-button" onClick={() => setShowModal(true)}>
            Alterar endereço
          </button>
        </div>
      </div>

      <div className="menu-panel">
        {items.length === 0 ? (
          <p>Carrinho vazio</p>
        ) : (
          <>
          <div className="cart-list">
            {items.map((item) => (
              <CartItemCard key={item.id} item={item} onRemove={onRemoveItem} />
            ))}
          </div>
          <div className="cart-total">
            <div>
              <h3>Total</h3>
              <p className="shipping-note">
                Frete: R$ {shipping.price.toFixed(2).replace('.', ',')}
                {shipping.distanceKm ? ` (${shipping.label})` : ` - ${shipping.label}`}
              </p>
            </div>
            <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
          </div>
          <button className="edit-address-button" onClick={handleConfirmarPedido} disabled={isConfirming}>
            {!isLoggedIn ? 'Entrar para confirmar pedido' : isConfirming ? 'Confirmando...' : 'Confirmar pedido'}
          </button>
        </>
      )}
      </div>

      <AddressModal
        isOpen={showModal}
        address={address}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAddress}
      />

    </section>
  );
}

export default ShoppingCartPage;
