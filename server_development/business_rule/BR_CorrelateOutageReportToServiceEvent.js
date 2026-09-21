/*
 * Business Rule: Correlate Outage Report to Service Event
 * When: (before/after - not specified)
 * Table: (Outage Report)
 *
 * Purpose: Uses the TOEMCorrelationEngine script include to either match
 * the current outage report to an existing service event or create a new
 * one, then links it back to the record via linked_event / link_status.
 */
(function executeRule(current, previous /*null when async*/) {

    var engine = new TOEMCorrelationEngine();
    var eventSysId = engine.correlateOrCreate(current);

    current.setValue('linked_event', eventSysId);
    current.setValue('link_status', 'linked');

})(current, previous);
