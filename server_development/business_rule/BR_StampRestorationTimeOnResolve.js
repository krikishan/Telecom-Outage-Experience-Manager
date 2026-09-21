/*
 * Business Rule: Stamp Restoration Time on Resolve
 * When: before update (implied)
 * Table: (Service Event)
 *
 * Purpose: Stamps restoration_time with the current date/time the first
 * time a record's status transitions to 'resolved', avoiding overwrites
 * on subsequent saves once already resolved.
 */
(function executeRule(current, previous) {

    // Only stamp if it wasn't already resolved (avoid overwriting on every save)
    if (previous.getValue('status') != 'resolved') {
        current.setValue('restoration_time', new GlideDateTime());
    }

})(current, previous);
