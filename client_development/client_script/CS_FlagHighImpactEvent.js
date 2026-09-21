/*
 * Client Script: Affected Customer Count - High Impact Warning
 * Type: onChange
 * Field: affected_customer_count
 * Table: (Telecom Outage Experience Manager - Outage table)
 *
 * Purpose: Warns the agent when the affected customer count reaches a
 * threshold (>=500) that indicates a high-impact event, suggesting they
 * consider escalating the Severity field to Critical.
 */
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var count = parseInt(newValue, 10);

    if (count >= 500) {
        g_form.showFieldMsg('affected_customer_count',
            'High-impact event — consider escalating Severity to Critical.',
            'warning');
    } else {
        g_form.hideFieldMsg('affected_customer_count', true);
    }
}
