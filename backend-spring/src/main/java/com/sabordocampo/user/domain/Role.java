package com.sabordocampo.user.domain;

public enum Role {
    ROLE_USER,
    ROLE_ADMIN;

    public String getAuthority() {
        return this.name();
    }
}