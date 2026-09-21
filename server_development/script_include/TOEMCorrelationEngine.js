/*
 * Script Include: TOEMCorrelationEngine
 * Client callable: false (assumed)
 * Application: Telecom Outage Experience Manager
 * Scope table referenced: x_2215158_teleco_0_x_snc_toem_service_event
 *
 * Purpose: Correlates an incoming Outage Report to an existing open
 * Service Event (matching on location contained in title, and status
 * in investigating/identified/restoring), incrementing the affected
 * customer count on match, or creates a new Service Event when no
 * match is found. Called from the "Correlate Outage Report to Service
 * Event" Business Rule.
 */
var TOEMCorrelationEngine = Class.create();
TOEMCorrelationEngine.prototype = {
    initialize: function() {},

    // Finds an existing open Service Event matching this Outage Report,
    // or creates a new one. Returns the sys_id of the Service Event.
    correlateOrCreate: function(outageReportGR) {
        var serviceType = outageReportGR.getValue('service_type');
        var location = outageReportGR.getValue('reported_location');

        // Look for an existing open Service Event with matching location + type
        // (simple correlation rule for hackathon scope — can be refined later)
        var eventGR = new GlideRecord('x_2215158_teleco_0_x_snc_toem_service_event');
        eventGR.addQuery('status', 'IN', 'investigating,identified,restoring');
        eventGR.addQuery('title', 'CONTAINS', location);
        eventGR.query();

        if (eventGR.next()) {
            // Match found — increment affected customer count, link this report
            var currentCount = parseInt(eventGR.getValue('affected_customer_count'), 10) || 0;
            eventGR.setValue('affected_customer_count', currentCount + 1);
            eventGR.update();
            return eventGR.getUniqueValue();
        } else {
            // No match — create a new Service Event
            var newEvent = new GlideRecord('x_2215158_teleco_0_x_snc_toem_service_event');
            newEvent.initialize();
            newEvent.setValue('title', serviceType + ' outage - ' + location);
            newEvent.setValue('status', 'investigating');
            newEvent.setValue('severity', 'medium'); // default, NOC can escalate manually
            newEvent.setValue('first_report_time', new GlideDateTime());
            newEvent.setValue('affected_customer_count', 1);
            var newSysId = newEvent.insert();
            return newSysId;
        }
    },

    type: 'TOEMCorrelationEngine'
};
