const STORE_REFERENCE = {
  neighborhood: 'Castelo',
  city: 'Belo Horizonte',
  state: 'MG',
  zipCode: '31330000',
};

const MIN_DISTANCE_KM = 1.5;

export function calculateDeliveryFee(address) {
  if (!address?.zipCode) {
    return {
      price: 0,
      distanceKm: null,
      label: 'Informe o endereco para calcular o frete',
    };
  }

  const distanceKm = estimateDistanceKm(address);
  const price = calculateFee(distanceKm);

  return {
    price,
    distanceKm,
    label: `${distanceKm.toFixed(1).replace('.', ',')} km estimados`,
  };
}

function calculateFee(distanceKm) {
  if (distanceKm <= 5) {
    return 5;
  }

  if (distanceKm <= 10) {
    return 8;
  }

  return 15;
}

function estimateDistanceKm(address) {
  const zipDistance = estimateZipDistance(address.zipCode);
  const sameCity = normalize(address.city) === normalize(STORE_REFERENCE.city);
  const sameState = normalize(address.state) === normalize(STORE_REFERENCE.state);
  const sameNeighborhood = normalize(address.neighborhood) === normalize(STORE_REFERENCE.neighborhood);

  if (sameNeighborhood && sameCity) {
    return Math.max(MIN_DISTANCE_KM, Math.min(zipDistance, 3));
  }

  if (sameCity) {
    return Math.max(3.5, zipDistance);
  }

  if (sameState) {
    return Math.max(18, zipDistance + 12);
  }

  return Math.max(35, zipDistance + 25);
}

function estimateZipDistance(zipCode) {
  const target = Number(String(zipCode).replace(/\D/g, ''));
  const origin = Number(STORE_REFERENCE.zipCode);

  if (!Number.isFinite(target) || target <= 0) {
    return MIN_DISTANCE_KM;
  }

  return Math.max(MIN_DISTANCE_KM, Math.min(60, Math.abs(target - origin) / 4500));
}

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}
