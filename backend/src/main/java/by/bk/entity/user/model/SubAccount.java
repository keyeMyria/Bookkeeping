package by.bk.entity.user.model;

import by.bk.entity.currency.Currency;
import lombok.Getter;

import java.util.Map;

/**
 * @author Sergey Koval
 */
@Getter
public class SubAccount implements Orderable, Selectable {
    private String title;
    private int order;
    private String icon;
    private Map<Currency, Double> balance;

    public SubAccount() {
    }

    public SubAccount(String title, int order, String icon, Map<Currency, Double> balance) {
        this.title = title;
        this.order = order;
        this.icon = icon;
        this.balance = balance;
    }
}