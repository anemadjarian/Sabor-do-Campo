export async function fetchAddressByCep(cep) {
  const normalizedCep = cep.replace(/\D/g, '');

  if (normalizedCep.length !== 8) {
    throw new Error('CEP deve ter 8 digitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
  const data = await response.json();

  if (!response.ok || data.erro) {
    throw new Error('CEP nao encontrado.');
  }

  return {
    zipCode: normalizedCep,
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}
