import { useEffect, useState } from 'react';
import Header from './components/Header';
import MenuPage from './pages/MenuPage';
import ProductFormPage from './pages/ProductFormPage';
import { useMenu } from './hooks/useMenu';
import { fetchCart, createCartItem, removeCartItem } from './services/cartService';
import { buscarPedidoAtivo, confirmarPedido } from './services/pedidoService';
import ShoppingCartPage from './pages/ShoppingCartPage';
import PedidoStatusPage from './pages/PedidoStatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import { getCurrentUser } from './services/profileService';

const LEGACY_PEDIDO_STORAGE_KEY = 'pedido_atual';

const pages = {
  menu: 'Cardapio'
};

function App() {
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState(null);
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const visiblePages = {
    ...pages,
    ...(isAdmin ? { admin: 'Produtos', adminUsers: 'Usuarios', adminOrders: 'Pedidos' } : {}),
  };

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

  const [pedidoAtual, setPedidoAtual] = useState(null);

  // carregar user pelo token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getCurrentUser()
      .then((data) => setUser({ ...data, token }))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  //  carregar pedido por usuario logado
  useEffect(() => {
    localStorage.removeItem(LEGACY_PEDIDO_STORAGE_KEY);

    if (!user || user.role === 'ROLE_ADMIN') {
      setPedidoAtual(null);
      return;
    }

    let isCurrent = true;

    async function loadPedidoAtivo() {
      try {
        const pedido = await buscarPedidoAtivo();
        if (!isCurrent) return;

        if (pedido?.id) {
          setPedidoAtual(pedido);
          return;
        }

        loadPedidoFromStorage();
      } catch {
        if (isCurrent) {
          loadPedidoFromStorage();
        }
      }
    }

    function loadPedidoFromStorage() {
      const saved = localStorage.getItem(getPedidoStorageKey(user.id));
      if (!saved) {
        setPedidoAtual(null);
        return;
      }

      try {
        setPedidoAtual(JSON.parse(saved));
      } catch {
        localStorage.removeItem(getPedidoStorageKey(user.id));
        setPedidoAtual(null);
      }
    }

    loadPedidoAtivo();

    return () => {
      isCurrent = false;
    };
  }, [user?.id, user?.role]);

  //  salvar pedido por usuario logado
  useEffect(() => {
    if (!user || user.role === 'ROLE_ADMIN') return;

    const storageKey = getPedidoStorageKey(user.id);
    if (!pedidoAtual?.id) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(pedidoAtual));
  }, [pedidoAtual, user?.id, user?.role]);

  //  carregar carrinho do usuário
  useEffect(() => {
    if (user) loadCart();
  }, [user]);

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
      alert('Voce precisa estar logado para adicionar itens ao carrinho.');
      setActivePage('login');
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

    setCart({ id: null, items: [], address: null });
    localStorage.removeItem('guest_cart');

    await loadCart();
    setActivePage('menu');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('guest_cart');
    setUser(null);
    setPedidoAtual(null);
    setCart({ id: null, items: [], address: null });
    setActivePage('home');
  }

  return (
    <div className="app-shell">
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        cartCount={cartCount}
        pages={visiblePages}
        user={user}
        hasActivePedido={Boolean(
          user && !isAdmin && pedidoAtual?.id && pedidoAtual?.status !== 'PEDIDO_ENTREGUE'
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
            isLoggedIn={Boolean(user)}
            onRequireLogin={() => {
              alert('Voce precisa estar logado para adicionar itens ao carrinho.');
              setActivePage('login');
            }}
            onRetry={refreshMenu}
          />
        )}

        {activePage === 'admin' && (
          isAdmin ? (
            <ProductFormPage
              categories={categories}
              onSubmit={addMenuItem}
              onSuccess={() => {
                refreshMenu();
                setActivePage('menu');
              }}
            />
          ) : (
            <section className="form-page">
              <div className="form-card">
                <p className="eyebrow">Acesso restrito</p>
                <h2>Area do admin</h2>
                <p>Entre com o usuario administrador para cadastrar produtos.</p>
              </div>
            </section>
          )
        )}

        {activePage === 'adminUsers' && (
          isAdmin ? (
            <AdminUsersPage />
          ) : (
            <section className="form-page">
              <div className="form-card">
                <p className="eyebrow">Acesso restrito</p>
                <h2>Usuarios</h2>
                <p>Entre com o usuario administrador para gerenciar usuarios.</p>
              </div>
            </section>
          )
        )}

        {activePage === 'adminOrders' && (
          isAdmin ? (
            <AdminOrdersPage />
          ) : (
            <section className="form-page">
              <div className="form-card">
                <p className="eyebrow">Acesso restrito</p>
                <h2>Pedidos</h2>
                <p>Entre com o usuario administrador para gerenciar pedidos.</p>
              </div>
            </section>
          )
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
          isAdmin ? (
            <AdminOrdersPage />
          ) : (
            <PedidoStatusPage
              pedido={pedidoAtual}
              onBackToMenu={() => setActivePage('menu')}
              onStatusChange={handlePedidoStatusChange}
            />
          )
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

function getPedidoStorageKey(userId) {
  return `pedido_atual_${userId}`;
}

export default App;
