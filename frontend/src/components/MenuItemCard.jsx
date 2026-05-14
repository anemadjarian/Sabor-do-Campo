function MenuItemCard({ item, onAddToCart, canAddToCart = true }) {
  return (
    <article className="menu-card">
      <div className="menu-card-image-wrapper">
        {item.imageUrl ? (
          <img className="menu-card-image" src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="menu-card-placeholder">Foto</div>
        )}
      </div>

      <div className="menu-card-content">
        <p className="item-category">{item.categoryLabel}</p>
        <h3>{item.name}</h3>
        <p className="item-description">{item.description}</p>
        {item.ingredients.length > 0 ? (
          <p className="item-ingredients">
            Ingredientes: {item.ingredients.join(', ')}
          </p>
        ) : null}
        <div className="menu-card-footer">
          <strong>R$ {Number(item.price).toFixed(2).replace('.', ',')}</strong>
          {canAddToCart ? (
            <button type="button" onClick={() => onAddToCart(item)}>
              Adicionar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default MenuItemCard;
