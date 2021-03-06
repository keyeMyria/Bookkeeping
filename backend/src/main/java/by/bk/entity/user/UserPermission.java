package by.bk.entity.user;

import org.springframework.security.core.GrantedAuthority;

/**
 * @author Sergey Koval
 */
public enum UserPermission implements GrantedAuthority {
    USER, ADMIN;

    @Override
    public String getAuthority() {
        return name();
    }
}