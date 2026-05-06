import { useEffect, useState } from 'react';
import { fetchAddressByCep } from '../services/cepService';

function AddressModal({ isOpen, address, onClose, onSave }) {
  const [formAddress, setFormAddress] = useState({});
  const [cepStatus, setCepStatus] = useState({ type: '', message: '' });
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormAddress(address || {});
      setCepStatus({ type: '', message: '' });
    }
  }, [isOpen, address]);

  useEffect(() => {
    if (!isOpen) return;

    const normalizedCep = (formAddress.zipCode || '').replace(/\D/g, '');
    if (normalizedCep.length !== 8) {
      if (cepStatus.message) {
        setCepStatus({ type: '', message: '' });
      }
      return;
    }

    let isCurrent = true;

    async function loadAddress() {
      setIsFetchingCep(true);
      setCepStatus({ type: '', message: '' });

      try {
        const cepAddress = await fetchAddressByCep(normalizedCep);
        if (!isCurrent) return;

        setFormAddress(prev => ({
          ...prev,
          ...cepAddress,
          number: prev.number || '',
          complement: prev.complement || ''
        }));
        setCepStatus({ type: 'success', message: 'Endereco encontrado pelo CEP.' });
      } catch (error) {
        if (!isCurrent) return;
        setCepStatus({ type: 'error', message: error.message });
      } finally {
        if (isCurrent) {
          setIsFetchingCep(false);
        }
      }
    }

    const timeoutId = window.setTimeout(loadAddress, 350);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [formAddress.zipCode, isOpen]);

  if (!isOpen) return null;

  function handleChange(field, value) {
    const nextValue = field === 'zipCode' ? value.replace(/\D/g, '').slice(0, 8) : value;

    setFormAddress(prev => ({
      ...prev,
      [field]: nextValue
    }));
  }

  function handleSubmit() {
    onSave(formAddress);
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Endereco de entrega</h3>

        <label className="modal-field">
          <span>CEP</span>
          <input
            inputMode="numeric"
            placeholder="Digite o CEP"
            value={formAddress.zipCode || ''}
            onChange={e => handleChange('zipCode', e.target.value)}
          />
        </label>

        {isFetchingCep ? (
          <p className="cep-status">Buscando endereco...</p>
        ) : cepStatus.message ? (
          <p className={cepStatus.type === 'success' ? 'cep-status success' : 'cep-status error'}>
            {cepStatus.message}
          </p>
        ) : null}

        <input
          placeholder="Rua"
          value={formAddress.street || ''}
          onChange={e => handleChange('street', e.target.value)}
        />

        <input
          placeholder="Numero"
          value={formAddress.number || ''}
          onChange={e => handleChange('number', e.target.value)}
        />

        <input
          placeholder="Bairro"
          value={formAddress.neighborhood || ''}
          onChange={e => handleChange('neighborhood', e.target.value)}
        />

        <input
          placeholder="Cidade"
          value={formAddress.city || ''}
          onChange={e => handleChange('city', e.target.value)}
        />

        <input
          placeholder="Estado"
          value={formAddress.state || ''}
          onChange={e => handleChange('state', e.target.value)}
        />

        <input
          placeholder="Complemento"
          value={formAddress.complement || ''}
          onChange={e => handleChange('complement', e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default AddressModal;
