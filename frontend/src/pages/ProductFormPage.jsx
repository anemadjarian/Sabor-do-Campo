import { useRef, useState } from 'react';

const initialForm = {
  name: '',
  description: '',
  price: '',
  ingredients: '',
  category: 'ENTRADA',
  imageUrl: '',
};

function ProductFormPage({ categories, items, onSubmit, onDelete, onSuccess }) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState(initialForm);
  const [editingItemId, setEditingItemId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const openDeleteModal = (item) => {
    setDeleteModalItem(item);
    setStatus({ type: '', message: '' });
  };

  const closeDeleteModal = () => {
    setDeleteModalItem(null);
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;

    setDeletingId(deleteModalItem.id);
    setStatus({ type: '', message: '' });

    try {
      await onDelete(deleteModalItem.id);
      setStatus({ type: 'success', message: 'Produto deletado com sucesso.' });
      closeDeleteModal();
    } catch (deleteError) {
      setStatus({ type: 'error', message: deleteError.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const normalizedPrice = Number.parseFloat(String(formData.price).replace(',', '.'));
      if (Number.isNaN(normalizedPrice)) {
        throw new Error('Preco invalido.');
      }

      const normalizedImageUrl = normalizeImageUrl(formData.imageUrl);
      const payload = {
        ...formData,
        price: Number(normalizedPrice.toFixed(2)),
        imageUrl: normalizedImageUrl,
      };

      if (editingItemId) {
        await onSubmit(editingItemId, payload);
        setStatus({ type: 'success', message: 'Produto atualizado com sucesso.' });
      } else {
        await onSubmit(payload);
        setStatus({ type: 'success', message: 'Produto cadastrado com sucesso.' });
      }
      setFormData({ ...initialForm, category: categories[0]?.value ?? 'ENTRADA' });
      setEditingItemId(null);
      onSuccess();
    } catch (submitError) {
      setStatus({ type: 'error', message: submitError.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name ?? '',
      description: item.description ?? '',
      price: String(item.price ?? ''),
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      category: item.category ?? categories[0]?.value ?? 'ENTRADA',
      imageUrl: item.imageUrl ?? '',
    });
    setStatus({ type: '', message: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setFormData({ ...initialForm, category: categories[0]?.value ?? 'ENTRADA' });
    setStatus({ type: '', message: '' });
  };

  return (
    <section className="form-page">
      <div className="form-card admin-product-panel">
        <p className="eyebrow">Painel interno</p>
        <h2>Cadastro do produto</h2>
        <p>
          Cadastre novos itens do cardápio com nome, preco, ingredientes e categoria.
        </p>

        <form ref={formRef} className="product-form" onSubmit={handleSubmit}>
          <label>
            <span>Nome do produto</span>
            <input value={formData.name} onChange={handleChange('name')} required />
          </label>

          <label>
            <span>Descricao</span>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              rows="4"
              required
            />
          </label>

          <div className="form-row">
            <label>
              <span>Preco</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange('price')}
                required
              />
            </label>

            <label>
              <span>Categoria</span>
              <select value={formData.category} onChange={handleChange('category')}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Ingredientes</span>
            <input
              value={formData.ingredients}
              onChange={handleChange('ingredients')}
              placeholder="Separe por virgula"
            />
          </label>

          <label>
            <span>URL da foto</span>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={handleChange('imageUrl')}
              placeholder="https://..."
            />
          </label>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : editingItemId ? 'Salvar alteracoes' : 'Cadastrar produto'}
          </button>

          {editingItemId ? (
            <button className="submit-button cancel-edit-button" type="button" onClick={handleCancelEdit} disabled={isSubmitting}>
              Cancelar edição
            </button>
          ) : null}

          {status.message ? (
            <p className={status.type === 'success' ? 'status-message success' : 'status-message error'}>
              {status.message}
            </p>
          ) : null}
        </form>

        <div className="admin-product-list">
          <div className="admin-product-list-heading">
            <h3>Produtos cadastrados</h3>
            <span>{items.length} itens</span>
          </div>

          {items.length === 0 ? (
            <p className="muted-message">Nenhum produto cadastrado.</p>
          ) : (
            <div className="admin-product-items">
              {items.map((item) => (
                <article key={item.id} className="admin-product-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.categoryLabel} - R$ {Number(item.price).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleStartEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      disabled={deletingId === item.id}
                      onClick={() => openDeleteModal(item)}
                    >
                      {deletingId === item.id ? 'Deletando...' : 'Deletar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteModalItem ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar exclusão de produto">
          <div className="modal-content">
            <h3>Excluir produto?</h3>
            <p>
              Ao deletar "{deleteModalItem.name}", ele será removido definitivamente do cardápio e não aparecerá mais para os clientes.
            </p>
            {deleteModalItem.imageUrl ? (
              <div className="menu-confirm-image-wrap">
                <img className="menu-confirm-image" src={deleteModalItem.imageUrl} alt={deleteModalItem.name} />
              </div>
            ) : null}
            <div className="modal-actions">
              <button type="button" onClick={handleDelete} disabled={deletingId === deleteModalItem.id}>
                {deletingId === deleteModalItem.id ? 'Deletando...' : 'Confirmar exclusão'}
              </button>
              <button type="button" className="confirm-cancel-button" onClick={closeDeleteModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function normalizeImageUrl(value) {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('www.')) return `https://${raw}`;
  return raw;
}

export default ProductFormPage;
