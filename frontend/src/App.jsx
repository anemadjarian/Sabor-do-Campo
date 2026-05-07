import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import MenuPage from './pages/MenuPage';
import ProductFormPage from './pages/ProductFormPage';
import { useMenu } from './hooks/useMenu';
import { fetchCart, createCartItem, removeCartItem } from './services/cartService';
import { confirmarPedido, listarMeusPedidos } from './services/pedidoService';
import ShoppingCartPage from './pages/ShoppingCartPage';
import PedidoStatusPage from './pages/PedidoStatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import { getCurrentUser } from './services/profileService';

const ACTIVE_PAGE_STORAGE_KEY = 'active_page';

const pages = {
  menu: 'Cardápio'
};

function App() {
  const [activePage, setActivePage] = useState(() => (
    localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY) || 'home'
  ));
  const [user, setUser] = useState(null);
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const visiblePages = {
    ...pages,
    ...(user && !isAdmin ? { pedidoStatus: 'Pedidos' } : {}),
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

  const [pedidosUsuario, setPedidosUsuario] = useState([]);
  const [isLoadingPedidosUsuario, setIsLoadingPedidosUsuario] = useState(false);

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

  useEffect(() => {
    localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, activePage);
  }, [activePage]);

  //  carregar pedidos do usuario logado pelo banco
  useEffect(() => {
    if (!user || user.role === 'ROLE_ADMIN') {
      setPedidosUsuario([]);
      setIsLoadingPedidosUsuario(false);
      return;
    }

    let isCurrent = true;

    async function loadPedidosUsuario() {
      setIsLoadingPedidosUsuario(true);

      try {
        const pedidos = await listarMeusPedidos();
        if (!isCurrent) return;
        setPedidosUsuario(
          Array.isArray(pedidos)
            ? pedidos.filter((pedido) => pedido.status !== 'PEDIDO_ENTREGUE')
            : []
        );
      } catch (error) {
        if (isCurrent) {
          console.error(error);
          setPedidosUsuario([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoadingPedidosUsuario(false);
        }
      }
    }

    loadPedidosUsuario();

    return () => {
      isCurrent = false;
    };
  }, [user?.id, user?.role]);

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
    setPedidosUsuario((current) => [
      pedido,
      ...current.filter((item) => item.id !== pedido.id && item.status !== 'PEDIDO_ENTREGUE'),
    ]);
    await loadCart();
    setActivePage('pedidoStatus');
  };

  const handlePedidoStatusChange = useCallback((pedidoId, nextStatus) => {
    setPedidosUsuario((current) => {
      let changed = false;
      const nextPedidos = current.map((pedido) => {
        if (pedido.id !== pedidoId || pedido.status === nextStatus) {
          return pedido;
        }

        changed = true;
        return { ...pedido, status: nextStatus };
      }).filter((pedido) => pedido.status !== 'PEDIDO_ENTREGUE');

      return changed ? nextPedidos : current;
    });
  }, []);

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
    localStorage.removeItem(ACTIVE_PAGE_STORAGE_KEY);
    setUser(null);
    setPedidosUsuario([]);
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
        hasActivePedido={false}
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
              pedidos={pedidosUsuario}
              isLoading={isLoadingPedidosUsuario}
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

export default App;
