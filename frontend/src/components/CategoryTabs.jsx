function CategoryTabs({ categories = [], selectedCategory, onChange }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Categorias do cardapio">
      <button
        type="button"
        className={selectedCategory === '' ? 'tab-button active' : 'tab-button'}
        onClick={() => onChange('')}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.value}
          type="button"
          className={selectedCategory === category.value ? 'tab-button active' : 'tab-button'}
          onClick={() => onChange(category.value)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
