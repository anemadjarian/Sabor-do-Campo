import { useEffect, useState } from 'react';
import Header from './components/Header';
import MenuPage from './pages/MenuPage';
import ProductFormPage from './pages/ProductFormPage';
import { useMenu } from './hooks/useMenu';
import { fetchCart, createCartItem, removeCartItem } from './services/cartService';
import { confirmarPedido } from './services/pedidoService';
import ShoppingCartPage from './pages/ShoppingCartPage';
import PedidoStatusPage from './pages/PedidoStatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';

const PEDIDO_STORAGE_KEY = 'pedido_atual';

const pages = {
  menu: 'Cardapio',
  admin: 'Cadastro'
};

function App() {
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState(null);

  const {
    categories,
    items,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    refreshMenu,
    addMenuItem,
  } = useMenu();

  const [cart, setCart] = useState({
    id: null,
    items: [],
    address: null
  });

  const [pedidoAtual, setPedidoAtual] = useState(() => {
    const saved = localStorage.getItem(PEDIDO_STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(PEDIDO_STORAGE_KEY);
      return null;
    }
  });

  // carregar user pelo token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
  }, []);

  //  salvar pedido
  useEffect(() => {
    if (!pedidoAtual?.id) {
      localStorage.removeItem(PEDIDO_STORAGE_KEY);
      return;
    }

    localStorage.setItem(PEDIDO_STORAGE_KEY, JSON.stringify(pedidoAtual));
  }, [pedidoAtual]);

  //  carregar carrinho do usuário
  useEffect(() => {
    if (user) loadCart();
  }, [user]);

  // carrinho guest
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('guest_cart');
      if (saved) setCart(JSON.parse(saved));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const cartCount = cart.items.length;

  async function loadCart() {
    const data = await fetchCart();

    if (!data) {
      setCart({ id: null, items: [], address: null });
      return;
    }

    setCart({
      id: data.id ?? null,
      items: data.items ?? [],
      address: data.address ?? null
    });
  }

  const handleAddToCart = async (item) => {
    if (!user) {
      setCart(prev => ({
        ...prev,
        items: [...prev.items, item]
      }));
      return;
    }

    await createCartItem(item.id);
    await loadCart();
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeCartItem(itemId);
      await loadCart();
    } catch {
      alert('Erro ao remover item');
    }
  };

  // pedido
  const handleConfirmarPedido = async () => {
    if (!user) {
      throw new Error('Voce precisa estar logado para confirmar o pedido.');
    }

    if (!cart.id) {
      throw new Error('Nao foi possivel identificar o carrinho para confirmar o pedido.');
    }

    const pedido = await confirmarPedido(cart.id);
    setPedidoAtual(pedido);
    await loadCart();
    setActivePage('pedidoStatus');
  };

  const handlePedidoStatusChange = (nextStatus) => {
    setPedidoAtual(prev => {
      if (!prev?.id || prev.status === nextStatus) return prev;
      return { ...prev, status: nextStatus };
    });
  };

  //  auth
  async function handleLogin(userData) {
    setUser(userData);

    // migrar carrinho guest → backend
    for (const item of cart.items) {
      await createCartItem(item.id);
    }

    setCart({ id: null, items: [], address: null });
    localStorage.removeItem('guest_cart');

    await loadCart();
    setActivePage('menu');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    setCart({ id: null, items: [], address: null });
    setActivePage('menu');
  }

  return (
    <div className="app-shell">
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        cartCount={cartCount}
        pages={pages}
        user={user}
        hasActivePedido={Boolean(
          user && pedidoAtual?.id && pedidoAtual?.status !== 'PEDIDO_ENTREGUE'
        )}
      />

      <main className="page-content">
        {activePage === 'home' && <HomePage onGoToMenu={() => setActivePage('menu')} />}

        {activePage === 'menu' && (
          <MenuPage
            categories={categories}
            items={items}
            isLoading={isLoading}
            error={error}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={handleAddToCart}
            onRetry={refreshMenu}
          />
        )}

        {activePage === 'admin' && (
          <ProductFormPage
            categories={categories}
            onSubmit={addMenuItem}
            onSuccess={() => {
              refreshMenu();
              setActivePage('menu');
            }}
          />
        )}

        {activePage === 'cart' && (
          <ShoppingCartPage
            items={cart.items}
            address={cart.address}
            isLoggedIn={Boolean(user)}
            onRequireLogin={() => setActivePage('login')}
            onRemoveItem={handleRemoveFromCart}
            onAddressUpdate={loadCart}
            onConfirmarPedido={handleConfirmarPedido}
          />
        )}

        {activePage === 'pedidoStatus' && (
          <PedidoStatusPage
            pedido={pedidoAtual}
            onBackToMenu={() => setActivePage('menu')}
            onStatusChange={handlePedidoStatusChange}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage onLogout={handleLogout} onNavigate={setActivePage} />
        )}

        {activePage === 'register' && (
          <RegisterPage onNavigate={setActivePage} />
        )}

        {activePage === 'login' && (
          <LoginPage onLogin={handleLogin} onNavigate={setActivePage} />
        )}
      </main>
    </div>
  );
}

export default App;
