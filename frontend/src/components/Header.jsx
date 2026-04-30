import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import logoImage from '../assets/imgs/logo.svg';

function Header({ activePage, onNavigate, cartCount, pages, hasActivePedido, user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={isMobileMenuOpen ? 'topbar mobile-menu-open' : 'topbar'}>
      <button
        type="button"
        className="brand-home-button"
        onClick={() => handleNavigate('home')}
        aria-label="Voltar para a pagina inicial"
      >
        <div className="brand-seal" aria-hidden="true">
          <img src={logoImage} alt="logoheader" />
        </div>
        <div>
          {activePage !== 'home' && <p className="eyebrow">Cardapio Digital</p>}
          <h1>Sabor do Campo</h1>
        </div>
      </button>

      <div className="mobile-quick-actions">
        <button
          type="button"
          className="mobile-icon-button"
          aria-label={`Carrinho com ${cartCount} itens`}
          onClick={() => handleNavigate('cart')}
        >
          <ShoppingCartIcon className="cart-icon" />
        </button>
        <button
          type="button"
          className="mobile-icon-button"
          aria-label="Acessar conta"
          onClick={() => handleNavigate(user ? 'profile' : 'login')}
        >
          <PersonIcon className="person-icon" />
        </button>
      </div>

      <button
        type="button"
        className="menu-toggle"
        aria-label="Abrir menu"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={isMobileMenuOpen ? 'topbar-nav mobile-open' : 'topbar-nav'}
        aria-label="Navegacao principal"
      >
        {Object.entries(pages).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={activePage === value ? 'nav-button active' : 'nav-button'}
            onClick={() => handleNavigate(value)}
          >
            {label}
          </button>
        ))}

        {hasActivePedido && (
          <button
            type="button"
            className={activePage === 'pedidoStatus' ? 'nav-button active' : 'nav-button'}
            onClick={() => handleNavigate('pedidoStatus')}
          >
            Pedido
          </button>
        )}

        <button
          type="button"
          className="cart-badge"
          aria-label={`Carrinho com ${cartCount} itens`}
          onClick={() => handleNavigate('cart')}
        >
          <ShoppingCartIcon className="cart-icon" />
          <strong>{cartCount}</strong>
        </button>
        <button
          type="button"
          className="person-badge"
          aria-label="Acessar conta"
          onClick={() => handleNavigate(user ? 'profile' : 'login')}
        >
          <PersonIcon className="person-icon" />
        </button>
      </nav>
    </header>
  );
}

export default Header;
