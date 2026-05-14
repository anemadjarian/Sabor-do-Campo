package com.sabordocampo.pedido.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.sabordocampo.cart.domain.Address;
import org.junit.jupiter.api.Test;

class FreteServiceTest {

    private final FreteService freteService = new FreteService();

    @Test
    void calcularDeveUsarDistanciaMinimaParaMesmoBairro() {
        Address address = new Address("Rua A", "10", "Castelo", "Belo Horizonte", "MG", "31330-000", null);

        FreteService.Frete frete = freteService.calcular(address);

        assertThat(frete.distanciaKm()).isEqualByComparingTo("1.50");
        assertThat(frete.valor()).isEqualByComparingTo("7.88");
    }

    @Test
    void calcularDeveAplicarAcrescimoParaOutraCidade() {
        Address address = new Address("Rua B", "20", "Centro", "Contagem", "MG", "31430-000", null);

        FreteService.Frete frete = freteService.calcular(address);

        assertThat(frete.distanciaKm()).isEqualByComparingTo("34.22");
        assertThat(frete.valor()).isEqualByComparingTo("48.78");
    }

    @Test
    void calcularDeveRetornarZeroQuandoCepNaoFoiInformado() {
        Address address = new Address("Rua C", "30", "Centro", "Cidade", "SP", "", null);

        FreteService.Frete frete = freteService.calcular(address);

        assertThat(frete.distanciaKm()).isNull();
        assertThat(frete.valor()).isZero();
    }
}
