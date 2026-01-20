package com.anh.e_commerce_platform.security;

import com.anh.e_commerce_platform.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // Email = username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // "Mes comptes n'expirent jamais"
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // "Mes comptes ne sont jamais bloqués"
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // "Mes mots de passe n'expirent jamais"
    }

    @Override
    public boolean isEnabled() {
        return true; // "Tous mes comptes sont actifs"
    }

    // Accès à l'entité User originale
    public User getUser() {
        return user;
    }
}
