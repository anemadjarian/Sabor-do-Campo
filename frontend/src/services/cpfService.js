export async function validateCpf(value) {
  const cpf = value.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return cpf === `${cpf.slice(0, 9)}${firstDigit}${secondDigit}`;
}

function calculateDigit(base, weight) {
  const sum = base
    .split("")
    .reduce((total, digit) => total + Number(digit) * weight--, 0);
  const rest = (sum * 10) % 11;

  return rest === 10 ? 0 : rest;
}
