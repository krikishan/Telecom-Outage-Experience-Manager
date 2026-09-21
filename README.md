# 📡 Telecom Outage Experience Manager (TOEM)

A **ServiceNow scoped application** built to streamline telecom outage management — from report intake and automated event correlation through to customer notification and resolution tracking.

---

## 🧭 Overview

The **Telecom Outage Experience Manager (TOEM)** provides Network Operations Centre (NOC) teams and telecom service managers with a structured, automated workflow for handling service outages. When customers report an outage, TOEM automatically correlates their reports to existing active Service Events (or creates new ones), keeps affected customers informed at every stage, and escalates critical events to the NOC team in real time.

### Key Capabilities

| Capability | Description |
|---|---|
| **Outage Report Intake** | Customers submit outage reports with service type and location |
| **Automated Correlation** | Reports are auto-matched to open Service Events or a new one is created |
| **Customer Notifications** | Automated emails at report link, event escalation, and resolution |
| **NOC Escalation** | Alerts the NOC team when a Service Event reaches Critical severity |
| **Resolution Timestamping** | Automatically stamps restoration time when a Service Event is resolved |
| **High-Impact Warnings** | Warns agents in real time when affected customer count hits >= 500 |

---

## 🗂️ Project Structure

```
Telecom-Outage-Experience-Manager/
│
├── automation/
│   ├── flow/                          # Flow Designer automation flows
│   │   ├── Flow_EscalateCriticalServiceEvent.md
│   │   ├── Flow_NotifyCustomerEventResolved.md
│   │   └── Flow_NotifyCustomerReportLinked.md
│   │
│   └── notification/                  # Email notification templates
│       ├── Notification_TOEM_CriticalEventEscalation.md
│       ├── Notification_TOEM_EventResolved.md
│       └── Notification_TOEM_ReportLinkedConfirmation.md
│
├── client_development/
│   ├── client_script/                 # Client-side scripts (runs in browser)
│   │   ├── CS_FilterEventToOpenOnly.js
│   │   └── CS_FlagHighImpactEvent.js
│   └── ui_policy/                     # UI policies (field visibility/mandatory rules)
│
├── data/
│   ├── table/                         # Custom table definitions
│   ├── table_column/                  # Custom column definitions
│   └── form_section/                  # Form layout sections
│
├── reporting/
│   └── report/                        # Saved reports and dashboards
│
├── security/
│   ├── access_control/                # ACL rules
│   └── role/                          # Custom roles
│
├── server_development/
│   ├── business_rule/                 # Server-side automation rules
│   │   ├── BR_CorrelateOutageReportToServiceEvent.js
│   │   └── BR_StampRestorationTimeOnResolve.js
│   └── script_include/                # Reusable server-side libraries
│       └── TOEMCorrelationEngine.js
│
├── user_interface/
│   └── list/                          # Custom list views
│
└── other/                             # Miscellaneous metadata & configuration
    ├── access_roles/
    ├── choice_set/
    ├── ecmascript_module/
    ├── field_label/
    ├── flow_block/
    ├── par_dashboard/
    ├── test/
    ├── test_step/
    └── ...
```

---

## ⚙️ Core Components

### 🔧 Server-Side Development

#### Script Include — `TOEMCorrelationEngine`
> `server_development/script_include/TOEMCorrelationEngine.js`

The heart of TOEM's automation logic. This reusable server-side library is responsible for intelligent event correlation:

- **Matches** an incoming Outage Report to an existing open Service Event by location (title contains) and active status (`investigating`, `identified`, `restoring`)
- **Increments** the `affected_customer_count` on a match
- **Creates** a new Service Event if no match is found, defaulting to `medium` severity for the NOC to review
- Called by the `BR_CorrelateOutageReportToServiceEvent` Business Rule

#### Business Rules

| File | Trigger | Purpose |
|---|---|---|
| `BR_CorrelateOutageReportToServiceEvent.js` | Outage Report: on insert | Calls `TOEMCorrelationEngine` to match/create a Service Event, then sets `linked_event` and `link_status = linked` |
| `BR_StampRestorationTimeOnResolve.js` | Service Event: before update | Stamps `restoration_time` the first time status transitions to `resolved` (does not overwrite on subsequent saves) |

---

### 🖥️ Client-Side Development

#### Client Scripts

| File | Type | Purpose |
|---|---|---|
| `CS_FilterEventToOpenOnly.js` | `onLoad` | Restricts the `event` reference field to only show events with status `investigating`, `identified`, or `restoring` |
| `CS_FlagHighImpactEvent.js` | `onChange` | Displays a **warning message** on the `affected_customer_count` field when the count reaches >= 500, prompting the agent to consider escalating severity to Critical |

---

### 🤖 Automation — Flows

All flows are built in **ServiceNow Flow Designer** and are set to **Active**.

#### 1. Notify Customer — Report Linked
> `automation/flow/Flow_NotifyCustomerReportLinked.md`

- **Trigger:** Outage Report created where `Link Status = Linked`
- **Action:** Sends the `TOEM - Report Linked Confirmation` notification to the reporting customer
- Acknowledges receipt and informs the customer their report has been correlated to an active investigation

#### 2. Notify Customer — Event Resolved
> `automation/flow/Flow_NotifyCustomerEventResolved.md`

- **Trigger:** Service Event updated where `Status = Resolved`
- **Actions:**
  1. Looks up all Outage Reports linked to the resolved Service Event
  2. Iterates over each report
  3. Sends the `TOEM - Event Resolved` notification to each affected customer
- Ensures every customer who reported the outage is individually notified on resolution

#### 3. Escalate Critical Service Event
> `automation/flow/Flow_EscalateCriticalServiceEvent.md`

- **Trigger:** Service Event updated where `Severity = Critical`
- **Action:** Sends the `TOEM - Critical Event Escalation` alert to the NOC manager group (`nocmanagergroup01@gmail.com`)
- Provides immediate escalation notification including the affected customer count

---

### 📧 Automation — Notifications

| Notification | Recipient | Subject | Trigger |
|---|---|---|---|
| `TOEM - Report Linked Confirmation` | Reporting customer | *We're aware of your outage report* | Report linked to a Service Event |
| `TOEM - Event Resolved` | Reporting customer | *Your reported issue has been resolved* | Service Event status → Resolved |
| `TOEM - Critical Event Escalation` | NOC manager group | *🚨 Critical Service Event* | Service Event severity → Critical |

---

## 🔄 End-to-End Workflow

```
Customer Submits Outage Report
        |
        v
BR: Correlate Outage Report to Service Event
        |
        +--[Match Found]--> Link to existing event + increment affected_customer_count
        |
        +--[No Match]-----> Create new Service Event (Severity=Medium, Status=Investigating)
        |
        v
link_status = Linked
        |
        v
Flow: Notify Customer - Report Linked
        |
        v
📧 Customer receives confirmation email

        |
        | (if affected_customer_count >= 500)
        v
⚠️  CS: High Impact Warning shown to agent in form

        |
        | (NOC escalates severity)
        v
Service Event Severity → Critical
        |
        v
Flow: Escalate Critical Service Event
        |
        v
📧 NOC Manager Group receives alert email

        |
        | (issue resolved)
        v
Service Event Status → Resolved
        |
        +---> BR: Stamp Restoration Time
        |
        +---> Flow: Notify Customer - Event Resolved
                |
                v
        📧 All linked customers notified of resolution
```

---

## 🛡️ Security

- **Access Controls (ACLs):** Configured under `security/access_control/` to restrict table-level and field-level access
- **Roles:** Custom roles defined under `security/role/` to scope permissions for NOC agents, managers, and customers

---

## 📊 Reporting

Pre-built reports are available under `reporting/report/` and a PAR dashboard is configured under `other/par_dashboard/` to provide NOC teams with at-a-glance visibility into:

- Open Service Events by severity and status
- Affected customer counts per event
- Mean Time to Resolution (MTTR) via restoration time stamps

---

## 🧪 Testing

Automated tests and test steps are stored under `other/test/` and `other/test_step/` respectively, supporting ATF (Automated Test Framework) validation of core workflows.

---

## 🚀 Getting Started

> **Prerequisites:** Access to a ServiceNow instance with the appropriate scope permissions.

1. **Import** the application update set or XML into your ServiceNow instance
2. **Verify** the custom tables (`x_2215158_teleco_0_x_snc_toem_service_event`, Outage Report) are created correctly
3. **Activate** all three Flow Designer flows
4. **Confirm** Business Rules are active on their respective tables
5. **Assign** the appropriate TOEM roles to NOC agents and managers
6. **Test** by submitting a sample Outage Report and verifying correlation, notification, and escalation behaviours

---

## 📝 Notes

- The correlation engine uses a **simple location-match rule** (title contains reported location) suitable for hackathon/demo scope — it can be refined with more sophisticated matching logic (e.g. geography radius, service type matching) for production use.
- All flows have **Error Handler: Off** — consider enabling error handling for production deployments.
- The NOC escalation email target (`nocmanagergroup01@gmail.com`) should be updated to a production distribution list before go-live.

---

*Built for the Telecom Outage Experience Manager hackathon on ServiceNow.*
