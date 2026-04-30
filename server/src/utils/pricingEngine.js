/**
 * ═══════════════════════════════════════════════════════════════════
 * Pricing Engine — Pure utility for discount calculation
 * ═══════════════════════════════════════════════════════════════════
 *
 * All amounts are in PAISA (1 ₹ = 100 paisa) to avoid floating-point issues.
 * Discounts are ADDITIVE: each rule's percentage is applied to the original
 * subtotal, not to the already-discounted amount.
 *
 * @param {number}   subtotalPaisa   – Original order total in paisa
 * @param {number}   totalClothes    – Number of clothing items in the order
 * @param {number}   orderHour       – Hour of day (0-23) when the order is placed
 * @param {number}   userOrderCount  – Number of completed (non-cancelled) orders by this user
 * @param {Array}    activeRules     – Array of active PricingRule documents, sorted by priority
 *
 * @returns {{
 *   discounts: Array<{ ruleType: string, label: string, discountPercent: number, discountAmount: number }>,
 *   totalDiscount: number,
 *   finalAmount: number
 * }}
 */
export function calculateDiscounts(subtotalPaisa, totalClothes, orderHour, userOrderCount, activeRules = []) {
    const discounts = [];

    for (const rule of activeRules) {
        if (!rule.isActive || !rule.config?.discountPercent) continue;

        let qualifies = false;

        switch (rule.type) {
            case 'bulk':
                if (rule.config.minItems && totalClothes >= rule.config.minItems) {
                    qualifies = true;
                }
                break;

            case 'off_peak': {
                const start = rule.config.startHour ?? 22;
                const end = rule.config.endHour ?? 6;

                // Handle overnight ranges (e.g., 22:00 → 06:00)
                if (start > end) {
                    qualifies = orderHour >= start || orderHour < end;
                } else {
                    qualifies = orderHour >= start && orderHour < end;
                }
                break;
            }

            case 'loyalty':
                if (rule.config.minOrders && userOrderCount >= rule.config.minOrders) {
                    qualifies = true;
                }
                break;

            default:
                break;
        }

        if (qualifies) {
            // Apply percentage to original subtotal (additive, not compounding)
            const discountAmount = Math.round(
                (subtotalPaisa * rule.config.discountPercent) / 100
            );

            discounts.push({
                ruleType: rule.type,
                label: rule.label,
                discountPercent: rule.config.discountPercent,
                discountAmount,   // in paisa
            });
        }
    }

    const totalDiscount = discounts.reduce((sum, d) => sum + d.discountAmount, 0);

    // Final amount can't go below zero
    const finalAmount = Math.max(0, subtotalPaisa - totalDiscount);

    return {
        discounts,
        totalDiscount,
        finalAmount,
    };
}
