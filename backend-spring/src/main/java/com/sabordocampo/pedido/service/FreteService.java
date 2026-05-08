package com.sabordocampo.pedido.service;

import com.sabordocampo.cart.domain.Address;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import org.springframework.stereotype.Service;

@Service
public class FreteService {

    private static final String STORE_NEIGHBORHOOD = "Castelo";
    private static final String STORE_CITY = "Belo Horizonte";
    private static final String STORE_STATE = "MG";
    private static final long STORE_ZIP_CODE = 31330000L;
    private static final double MIN_DISTANCE_KM = 1.5;

    public Frete calcular(Address address) {
        if (address == null || address.getZipCode() == null || address.getZipCode().isBlank()) {
            return new Frete(BigDecimal.ZERO, null);
        }

        double distanceKm = estimateDistanceKm(address);
        BigDecimal price = BigDecimal.valueOf(calculateFee(distanceKm)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal distance = BigDecimal.valueOf(distanceKm).setScale(2, RoundingMode.HALF_UP);

        return new Frete(price, distance);
    }

    private double calculateFee(double distanceKm) {
        if (distanceKm <= 5) {
            return 5.0;
        }
        if (distanceKm <= 10) {
            return 8.0;
        }
        return 15.0;
    }

    private double estimateDistanceKm(Address address) {
        double zipDistance = estimateZipDistance(address.getZipCode());
        boolean sameCity = normalize(address.getCity()).equals(normalize(STORE_CITY));
        boolean sameState = normalize(address.getState()).equals(normalize(STORE_STATE));
        boolean sameNeighborhood = normalize(address.getNeighborhood()).equals(normalize(STORE_NEIGHBORHOOD));

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

    private double estimateZipDistance(String zipCode) {
        String digits = zipCode.replaceAll("\\D", "");
        if (digits.isBlank()) {
            return MIN_DISTANCE_KM;
        }

        long target;
        try {
            target = Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            return MIN_DISTANCE_KM;
        }

        if (target <= 0) {
            return MIN_DISTANCE_KM;
        }

        return Math.max(MIN_DISTANCE_KM, Math.min(60, Math.abs(target - STORE_ZIP_CODE) / 4500.0));
    }

    private String normalize(String value) {
        String normalized = Normalizer.normalize(value == null ? "" : value.trim().toLowerCase(), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }

    public record Frete(BigDecimal valor, BigDecimal distanciaKm) {
    }
}
