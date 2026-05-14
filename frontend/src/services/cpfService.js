export async function validateCpf(cpf) {
  const normalizedCpf = cpf.replace(/\D/g, '');

  if (normalizedCpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1+$/.test(normalizedCpf)) {
    return false;
  }

  function calculateDigit(cpfSlice, factor) {
    let total = 0;

    for (let i = 0; i < cpfSlice.length; i += 1) {
      total += Number(cpfSlice[i]) * factor--;
    }

    const remainder = (total * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  }

  const firstDigit = calculateDigit(normalizedCpf.slice(0, 9), 10);

  if (firstDigit !== Number(normalizedCpf[9])) {
    return false;
  }

  const secondDigit = calculateDigit(normalizedCpf.slice(0, 10), 11);

  if (secondDigit !== Number(normalizedCpf[10])) {
    return false;
  }

  return true;
}