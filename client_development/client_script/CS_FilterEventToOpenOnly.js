/*
 * Client Script: Filter Event to Open Only
 * Type: onLoad
 * Field: event (reference field)
 *
 * Purpose: Restricts the reference lookup/filter on the "event" field so
 * only events currently in an open state (investigating, identified,
 * restoring) are selectable.
 */
function onLoad() {
    g_form.addFilter('event', 'status', 'IN', 'investigating,identified,restoring');
}
