import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function CartItemCard({ item, onRemove }) {
  return (
    <article className="cart-card">
      <div className="cart-card-image-wrapper">
        {item.imageUrl ? (
          <img className="cart-card-image" src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="cart-card-placeholder">Foto</div>
        )}
      </div>
      <div className="cart-card-content">
        <h3>{item.name}</h3>
      </div>
      <div className="cart-card-price">
        <strong>R$ {Number(item.price).toFixed(2).replace('.', ',')}</strong>
      </div>
      <button
        type="button"
        className="cart-card-remove"
        onClick={() => onRemove(item.id)}
      >
        <RemoveCircleOutlineIcon />
      </button>
    </article>
  );
}

export default CartItemCard;