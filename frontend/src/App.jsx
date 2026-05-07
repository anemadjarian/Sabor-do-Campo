import { useEffect, useState } from 'react';
import Header from './components/Header';
import MenuPage from './pages/MenuPage';
import ProductFormPage from './pages/ProductFormPage';
import { useMenu } from './hooks/useMenu';
import { fetchCart, createCartItem, removeCartItem } from './services/cartService';
import { buscarPedidosAtivos, confirmarPedido } from './services/pedidoService';
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
  menu: 'Cardápio'
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
    editMenuItem,
    removeMenuItem,
  } = useMenu();

  const [cart, setCart] = useState({
    id: null,
    items: [],
    address: null
  });

  const [pedidosAtivos, setPedidosAtivos] = useState([]);

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

  //  carregar pedidos ativos por usuario logado
  useEffect(() => {
    localStorage.removeItem(LEGACY_PEDIDO_STORAGE_KEY);

    if (!user || user.role === 'ROLE_ADMIN') {
      setPedidosAtivos([]);
      return;
    }

    let isCurrent = true;

    async function loadPedidosAtivos() {
      try {
        const pedidos = await buscarPedidosAtivos();
        if (!isCurrent) return;

        if (Array.isArray(pedidos)) {
          setPedidosAtivos(pedidos);
          return;
        }

        loadPedidosFromStorage();
      } catch {
        if (isCurrent) {
          loadPedidosFromStorage();
        }
      }
    }

    function loadPedidosFromStorage() {
      const saved = localStorage.getItem(getPedidoStorageKey(user.id));
      if (!saved) {
        setPedidosAtivos([]);
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        setPedidosAtivos(Array.isArray(parsed) ? parsed : parsed?.id ? [parsed] : []);
      } catch {
        localStorage.removeItem(getPedidoStorageKey(user.id));
        setPedidosAtivos([]);
      }
    }

    loadPedidosAtivos();

    return () => {
      isCurrent = false;
    };
  }, [user?.id, user?.role]);

  //  salvar pedidos por usuario logado
  useEffect(() => {
    if (!user || user.role === 'ROLE_ADMIN') return;

    const storageKey = getPedidoStorageKey(user.id);
    if (pedidosAtivos.length === 0) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(pedidosAtivos));
  }, [pedidosAtivos, user?.id, user?.role]);

  //  carregar carrinho do usuário
  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN') {
      loadCart();
      return;
    }

    setCart({ id: null, items: [], address: null });
  }, [user]);

  useEffect(() => {
    if (isAdmin && activePage === 'cart') {
      setActivePage('adminOrders');
    }
  }, [activePage, isAdmin]);

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

    if (isAdmin) {
      alert('O administrador nao usa carrinho.');
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
    setPedidosAtivos((current) => [
      pedido,
      ...current.filter((item) => item.id !== pedido.id),
    ]);
    await loadCart();
    setActivePage('pedidoStatus');
  };

  const handlePedidoStatusChange = (pedidoId, nextStatus) => {
    setPedidosAtivos((current) => current.map((pedido) => (
      pedido.id === pedidoId && pedido.status !== nextStatus
        ? { ...pedido, status: nextStatus }
        : pedido
    )));
  };

  //  auth
  async function handleLogin(userData) {
    setUser(userData);

    setCart({ id: null, items: [], address: null });
    localStorage.removeItem('guest_cart');

    if (userData.role !== 'ROLE_ADMIN') {
      await loadCart();
    }
    setActivePage('menu');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('guest_cart');
    setUser(null);
    setPedidosAtivos([]);
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
        showCart={!isAdmin}
        hasActivePedido={Boolean(
          user
          && !isAdmin
          && pedidosAtivos.some((pedido) => pedido.status !== 'PEDIDO_ENTREGUE')
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
            canAddToCart={!isAdmin}
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
              items={items}
              onSubmit={(idOrPayload, maybePayload) => (
                typeof idOrPayload === 'number'
                  ? editMenuItem(idOrPayload, maybePayload)
                  : addMenuItem(idOrPayload)
              )}
              onDelete={removeMenuItem}
              onSuccess={() => {
                refreshMenu();
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
          isAdmin ? (
            <AdminOrdersPage />
          ) : (
            <ShoppingCartPage
              items={cart.items}
              address={cart.address}
              isLoggedIn={Boolean(user)}
              onRequireLogin={() => setActivePage('login')}
              onRemoveItem={handleRemoveFromCart}
              onAddressUpdate={loadCart}
              onConfirmarPedido={handleConfirmarPedido}
            />
          )
        )}

        {activePage === 'pedidoStatus' && (
          isAdmin ? (
            <AdminOrdersPage />
          ) : (
            <PedidoStatusPage
              pedidos={pedidosAtivos}
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
