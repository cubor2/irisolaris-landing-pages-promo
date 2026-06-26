var SPREADSHEET_ID = "1BM7ow3NBnbc-ItYQV8czw0cvmjKI36G5tBYac-XnI1c";
var DASHBOARD_SHEET = "Dashboard";
var EVENTS_SHEET = "Events";
var LEADS_SHEET = "Leads";

var LEAD_HEADERS = [
  "Date",
  "Landing ID",
  "Landing",
  "Session ID",
  "Propriétaire",
  "Type logement",
  "Surface (m²)",
  "Code postal",
  "Besoin",
  "Chauffage actuel",
  "Type projet",
  "Délai",
  "Prénom",
  "Nom",
  "Téléphone",
  "Email",
  "Consentement RGPD",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "UTM Term",
  "UTM Content",
  "Page URL",
  "User Agent"
];

var EVENT_HEADERS = [
  "Date",
  "Événement",
  "Session ID",
  "Landing ID",
  "Landing",
  "Durée (s)",
  "Étape formulaire",
  "Page URL",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "User Agent"
];

var LANDING_DEFINITIONS = [
  { id: "pac-climatisation", label: "PAC Climatisation" },
  { id: "pac-piscine", label: "PAC Piscine" },
  { id: "centrale-pv", label: "Centrale PV" }
];

var LANDING_ID_ALIASES = {
  "pack-piscine": "pac-piscine"
};

var DASHBOARD_ROWS = [
  {
    label: "Visiteurs (sessions uniques)",
    key: "visitors",
    format: "integer",
    help: "Nombre de visiteurs différents sur la page. Chaque personne est comptée une fois par visite (session). Comptabilisé uniquement si le visiteur accepte les cookies analytics."
  },
  {
    label: "Pages vues",
    key: "pageviews",
    format: "integer",
    help: "Nombre total de fois où la page a été ouverte ou rechargée, toutes sessions confondues."
  },
  {
    label: "Temps moyen sur la page (secondes)",
    key: "avgDuration",
    format: "integer",
    help: "Durée moyenne passée sur la landing page, calculée au moment où le visiteur quitte la page (fermeture de l'onglet ou navigation ailleurs)."
  },
  {
    label: "Visites courtes (< 30 s)",
    key: "shortVisits",
    format: "integer",
    help: "Nombre de sessions de moins de 30 secondes sur la page. Indique les visites très brèves (consultation rapide ou rebond)."
  }
];

function doGet(e) {
  ensureWorkbook_();
  var params = (e && e.parameter) ? e.parameter : {};

  if (isEventRequest_(params)) {
    appendEvent_(params);
    refreshDashboardValues_();
    return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
  }

  return jsonResponse_({ status: "ok", message: "ISS Landing Pages — endpoint actif" });
}

function doPost(e) {
  var params = e.parameter || {};
  ensureWorkbook_();

  if (isEventRequest_(params)) {
    appendEvent_(params);
    refreshDashboardValues_();
    return jsonResponse_({ success: true, type: "event" });
  }

  if (isLeadRequest_(params)) {
    if (!isCompleteLead_(params)) {
      return jsonResponse_({ success: false, error: "incomplete" });
    }
    appendLead_(params);
    refreshDashboardValues_();
    return jsonResponse_({ success: true, type: "lead" });
  }

  return jsonResponse_({ success: false, error: "rejected" });
}

function isEventRequest_(params) {
  if (params.record_type === "event") {
    return true;
  }

  if (params.event_type && params.record_type !== "lead" && params.form_complete !== "oui") {
    return true;
  }

  return false;
}

function isLeadRequest_(params) {
  return params.record_type === "lead" || params.form_complete === "oui";
}

function isCompleteLead_(params) {
  if (params.consentement_rgpd !== "oui") {
    return false;
  }

  var required = [
    "proprietaire",
    "type_logement",
    "surface",
    "code_postal",
    "besoin",
    "chauffage_actuel",
    "type_projet",
    "delai",
    "prenom",
    "nom",
    "telephone",
    "email"
  ];

  for (var i = 0; i < required.length; i++) {
    var value = params[required[i]];
    if (!value || String(value).trim() === "") {
      return false;
    }
  }

  return true;
}

function appendLead_(params) {
  var sheet = getSheetByName_(LEADS_SHEET);
  ensureLeadHeaders_(sheet);

  sheet.appendRow([
    new Date(),
    params.landing_id || "",
    params.landing_label || "",
    params.session_id || "",
    params.proprietaire || "",
    params.type_logement || "",
    params.surface || "",
    params.code_postal || "",
    params.besoin || "",
    params.chauffage_actuel || "",
    params.type_projet || "",
    params.delai || "",
    params.prenom || "",
    params.nom || "",
    params.telephone || "",
    params.email || "",
    params.consentement_rgpd || "",
    params.utm_source || "",
    params.utm_medium || "",
    params.utm_campaign || "",
    params.utm_term || "",
    params.utm_content || "",
    params.page_url || "",
    params.user_agent || ""
  ]);
}

function appendEvent_(params) {
  var sheet = getSheetByName_(EVENTS_SHEET);
  ensureEventHeaders_(sheet);

  sheet.appendRow([
    new Date(),
    params.event_type || "",
    params.session_id || "",
    params.landing_id || "",
    params.landing_label || "",
    params.duration_seconds || "",
    params.form_step || "",
    params.page_url || "",
    params.utm_source || "",
    params.utm_medium || "",
    params.utm_campaign || "",
    params.user_agent || ""
  ]);
}

function ensureWorkbook_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  getSheetByName_(DASHBOARD_SHEET);
  getSheetByName_(EVENTS_SHEET);
  var leadsSheet = getSheetByName_(LEADS_SHEET);
  ensureLeadHeaders_(leadsSheet);
  ensureEventHeaders_(ss.getSheetByName(EVENTS_SHEET));
  ensureDashboardLayout_(ss.getSheetByName(DASHBOARD_SHEET));
  moveSheetFirst_(ss, DASHBOARD_SHEET);
}

function getSheetByName_(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function moveSheetFirst_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet && ss.getSheets()[0].getName() !== name) {
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  }
}

function ensureLeadHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LEAD_HEADERS);
    return;
  }

  repairLeadsSheet_(sheet);
}

function repairLeadsSheet_(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LEADS_SHEET);
  }

  if (!sheet) {
    return;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LEAD_HEADERS);
    return;
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (headers.indexOf("Session ID") === -1 && headers.indexOf("Landing") !== -1) {
    sheet.insertColumnAfter(3);
  }

  sheet.getRange(1, 1, 1, LEAD_HEADERS.length).setValues([LEAD_HEADERS]);
  repairLeadsData_(sheet);
}

function repairLeadsData_(sheet) {
  var propIdx = LEAD_HEADERS.indexOf("Propriétaire");
  var emailIdx = LEAD_HEADERS.indexOf("Email");
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return;
  }

  var width = Math.max(sheet.getLastColumn(), LEAD_HEADERS.length);
  var data = sheet.getRange(2, 1, lastRow, width).getValues();

  for (var r = 0; r < data.length; r++) {
    var row = data[r];
    var propVal = String(row[propIdx] || "").trim();
    var nextVal = String(row[propIdx + 1] || "").trim();

    if (propVal !== "Oui" && propVal !== "Non" && (nextVal === "Oui" || nextVal === "Non")) {
      row = row.slice(0, propIdx).concat(row.slice(propIdx + 1));
      while (row.length < LEAD_HEADERS.length) {
        row.push("");
      }
      data[r] = row.slice(0, LEAD_HEADERS.length);
    }
  }

  for (var i = 0; i < data.length; i++) {
    var emailVal = String(data[i][emailIdx] || "").trim();
    if (emailVal.indexOf("@") !== -1) {
      continue;
    }

    for (var c = 0; c < data[i].length; c++) {
      if (String(data[i][c] || "").indexOf("@") === -1) {
        continue;
      }

      var offset = c - emailIdx;
      if (offset <= 0) {
        break;
      }

      var shifted = data[i].slice(offset);
      while (shifted.length < LEAD_HEADERS.length) {
        shifted.push("");
      }
      data[i] = shifted.slice(0, LEAD_HEADERS.length);
      break;
    }
  }

  var normalized = data.map(function (row) {
    var copy = row.slice(0, LEAD_HEADERS.length);
    while (copy.length < LEAD_HEADERS.length) {
      copy.push("");
    }
    return copy;
  });

  sheet.getRange(2, 1, lastRow, LEAD_HEADERS.length).setValues(normalized);
}

function ensureEventHeaders_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }
  sheet.appendRow(EVENT_HEADERS);
}

function getDashboardColumnCount_() {
  return LANDING_DEFINITIONS.length + 3;
}

function getDashboardHelpColumn_() {
  return LANDING_DEFINITIONS.length + 3;
}

function isDashboardLayoutReady_(sheet) {
  if (sheet.getRange("A1").getValue() !== "Tableau de bord — Landing Pages Promo") {
    return false;
  }

  if (sheet.getRange("A4").getValue() !== "Indicateur") {
    return false;
  }

  if (sheet.getRange("B4").getValue() !== LANDING_DEFINITIONS[0].label) {
    return false;
  }

  if (sheet.getRange(4, getDashboardHelpColumn_()).getValue() !== "Comment c'est calculé") {
    return false;
  }

  if (String(sheet.getRange("A2").getValue()).indexOf("HubSpot") === -1) {
    return false;
  }

  var expectedLastRow = 4 + DASHBOARD_ROWS.length;
  if (sheet.getLastRow() < expectedLastRow) {
    return false;
  }

  return sheet.getRange(expectedLastRow, 1).getValue() === DASHBOARD_ROWS[DASHBOARD_ROWS.length - 1].label;
}

function ensureDashboardLayout_(sheet) {
  if (!isDashboardLayoutReady_(sheet)) {
    applyDashboardLayout_(sheet);
  }
}

function applyDashboardLayout_(sheet) {
  sheet.clear();

  var colCount = getDashboardColumnCount_();
  var header = ["Indicateur"];
  LANDING_DEFINITIONS.forEach(function (landing) {
    header.push(landing.label);
  });
  header.push("Total");
  header.push("Comment c'est calculé");

  var rows = [];
  var titleRow = [];
  var subtitleRow = [];
  var spacerRow = [];
  var i;

  for (i = 0; i < colCount; i++) {
    titleRow.push("");
    subtitleRow.push("");
    spacerRow.push("");
  }

  titleRow[0] = "Tableau de bord — Landing Pages Promo";
  subtitleRow[0] = "Statistiques de visite (onglet Events). Les demandes de devis sont gérées dans HubSpot.";
  rows.push(titleRow);
  rows.push(subtitleRow);
  rows.push(spacerRow);
  rows.push(header.slice());

  DASHBOARD_ROWS.forEach(function (item) {
    var row = [item.label];
    var i;
    for (i = 0; i < LANDING_DEFINITIONS.length + 1; i++) {
      row.push("");
    }
    row.push(item.help);
    rows.push(row);
  });

  sheet.getRange(1, 1, rows.length, colCount).setValues(rows);
  sheet.getRange(1, 1, 1, colCount).merge();
  sheet.getRange(2, 1, 2, colCount).merge();
  sheet.getRange("A1").setFontSize(14).setFontWeight("bold");
  sheet.getRange("A2").setFontSize(10).setFontColor("#5a6b7d");
  sheet.getRange(4, 1, 1, colCount).setFontWeight("bold").setBackground("#f4f7fb");
  sheet.getRange(5, getDashboardHelpColumn_(), DASHBOARD_ROWS.length, 1).setFontColor("#5a6b7d").setFontSize(10).setWrap(true);
  sheet.setColumnWidth(1, 280);

  LANDING_DEFINITIONS.forEach(function (landing, index) {
    sheet.setColumnWidth(2 + index, 130);
  });

  sheet.setColumnWidth(LANDING_DEFINITIONS.length + 2, 100);
  sheet.setColumnWidth(getDashboardHelpColumn_(), 420);
  sheet.setFrozenRows(4);
}

function createLandingBucket_() {
  return {
    pageviewSessions: {},
    formStartSessions: {},
    pageviews: 0,
    durations: [],
    shortVisits: 0,
    leads: 0,
    leadsLast7Days: 0,
    lastLeadDate: null
  };
}

function normalizeLandingId_(landingId, landingLabel) {
  var id = String(landingId || "").trim().toLowerCase();

  if (LANDING_ID_ALIASES[id]) {
    id = LANDING_ID_ALIASES[id];
  }

  if (id) {
    for (var i = 0; i < LANDING_DEFINITIONS.length; i++) {
      if (LANDING_DEFINITIONS[i].id === id) {
        return LANDING_DEFINITIONS[i].id;
      }
    }
  }

  var label = String(landingLabel || "").trim().toLowerCase();
  for (var j = 0; j < LANDING_DEFINITIONS.length; j++) {
    if (LANDING_DEFINITIONS[j].label.toLowerCase() === label) {
      return LANDING_DEFINITIONS[j].id;
    }
  }

  return "";
}

function applyEventToBucket_(bucket, type, session, duration) {
  if (type === "pageview") {
    bucket.pageviews++;
    if (session) {
      bucket.pageviewSessions[session] = true;
    }
  }

  if (type === "form_start" && session) {
    bucket.formStartSessions[session] = true;
  }

  if (type === "session_end" && !isNaN(duration)) {
    bucket.durations.push(duration);
    if (duration < 30) {
      bucket.shortVisits++;
    }
  }
}

function applyLeadToBucket_(bucket, date, sevenDaysAgo) {
  bucket.leads++;

  if (date instanceof Date) {
    if (date >= sevenDaysAgo) {
      bucket.leadsLast7Days++;
    }
    if (!bucket.lastLeadDate || date > bucket.lastLeadDate) {
      bucket.lastLeadDate = date;
    }
  }
}

function finalizeLandingBucket_(bucket) {
  var visitors = Object.keys(bucket.pageviewSessions).length;
  var formStarts = Object.keys(bucket.formStartSessions).length;
  var leads = bucket.leads;
  var avgDuration = 0;

  if (bucket.durations.length > 0) {
    var total = bucket.durations.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    avgDuration = Math.round(total / bucket.durations.length);
  }

  return {
    visitors: visitors,
    pageviews: bucket.pageviews,
    avgDuration: avgDuration,
    formStarts: formStarts,
    leads: leads,
    conversion: visitors > 0 ? leads / visitors : 0,
    formAbandon: formStarts > 0 ? (formStarts - leads) / formStarts : 0,
    exitNoForm: visitors > 0 ? (visitors - formStarts) / visitors : 0,
    shortVisits: bucket.shortVisits,
    leadsLast7Days: bucket.leadsLast7Days,
    lastLeadDate: bucket.lastLeadDate
  };
}

function computeDashboardMetrics_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var eventsSheet = ss.getSheetByName(EVENTS_SHEET);
  var leadsSheet = ss.getSheetByName(LEADS_SHEET);
  var buckets = {};
  var totalBucket = createLandingBucket_();
  var events = [];
  var now = new Date();
  var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  LANDING_DEFINITIONS.forEach(function (landing) {
    buckets[landing.id] = createLandingBucket_();
  });

  if (eventsSheet && eventsSheet.getLastRow() > 1) {
    events = eventsSheet.getRange(2, 1, eventsSheet.getLastRow(), eventsSheet.getLastColumn()).getValues();
  }

  events.forEach(function (row) {
    var type = String(row[1] || "");
    var session = String(row[2] || "");
    var landingKey = normalizeLandingId_(row[3], row[4]);
    var duration = parseFloat(row[5]);
    var targets = [totalBucket];

    if (landingKey && buckets[landingKey]) {
      targets.push(buckets[landingKey]);
    }

    targets.forEach(function (bucket) {
      applyEventToBucket_(bucket, type, session, duration);
    });
  });

  if (leadsSheet && leadsSheet.getLastRow() > 1) {
    var headers = leadsSheet.getRange(1, 1, 1, leadsSheet.getLastColumn()).getValues()[0];
    var emailCol = headers.indexOf("Email");
    var leadRows = leadsSheet.getRange(2, 1, leadsSheet.getLastRow(), leadsSheet.getLastColumn()).getValues();

    leadRows.forEach(function (row) {
      if (emailCol === -1 || !String(row[emailCol] || "").trim()) {
        return;
      }

      var landingKey = normalizeLandingId_(row[1], row[2]);
      var date = row[0];
      var targets = [totalBucket];

      if (landingKey && buckets[landingKey]) {
        targets.push(buckets[landingKey]);
      }

      targets.forEach(function (bucket) {
        applyLeadToBucket_(bucket, date, sevenDaysAgo);
      });
    });
  }

  var landings = {};
  LANDING_DEFINITIONS.forEach(function (landing) {
    landings[landing.id] = finalizeLandingBucket_(buckets[landing.id]);
  });

  return {
    landings: landings,
    total: finalizeLandingBucket_(totalBucket)
  };
}

function refreshDashboardValues_(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DASHBOARD_SHEET);
  }

  if (!sheet) {
    return;
  }

  ensureDashboardLayout_(sheet);

  var metrics = computeDashboardMetrics_();
  var firstValueCol = 2;
  var firstRow = 5;

  DASHBOARD_ROWS.forEach(function (item, index) {
    var rowNum = firstRow + index;
    var rowValues = [];

    LANDING_DEFINITIONS.forEach(function (landing) {
      var value = metrics.landings[landing.id][item.key];
      rowValues.push(value == null ? "" : value);
    });

    var totalValue = metrics.total[item.key];
    rowValues.push(totalValue == null ? "" : totalValue);
    var valueRange = sheet.getRange(rowNum, firstValueCol, 1, rowValues.length);
    valueRange.setValues([rowValues]);

    if (item.format === "percent") {
      valueRange.setNumberFormat("0.0%");
    }

    if (item.format === "datetime") {
      valueRange.setNumberFormat("dd/mm/yyyy hh:mm");
    }
  });
}

function cleanParasiteLeads() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LEADS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) {
    return 0;
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var emailCol = headers.indexOf("Email");
  var telCol = headers.indexOf("Téléphone");
  var prenomCol = headers.indexOf("Prénom");
  var propCol = headers.indexOf("Propriétaire");
  var data = sheet.getDataRange().getValues();
  var removed = 0;

  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    var email = emailCol === -1 ? "" : String(row[emailCol] || "").trim();
    var telephone = telCol === -1 ? "" : String(row[telCol] || "").trim();
    var prenom = prenomCol === -1 ? "" : String(row[prenomCol] || "").trim();
    var proprietaire = propCol === -1 ? "" : String(row[propCol] || "").trim();

    if (!email && !telephone && !prenom && !proprietaire) {
      sheet.deleteRow(i + 1);
      removed++;
    }
  }

  return removed;
}

function setupAll() {
  ensureWorkbook_();
  repairLeadsSheet_();
  var removed = cleanParasiteLeads();
  removeDefaultEmptySheets_();
  refreshDashboardValues_();
  return removed;
}

function cleanDefaultSheets() {
  return removeDefaultEmptySheets_();
}

function removeDefaultEmptySheets_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  var keep = [DASHBOARD_SHEET, EVENTS_SHEET, LEADS_SHEET];
  var removed = 0;

  if (sheets.length <= 1) {
    return 0;
  }

  for (var i = sheets.length - 1; i >= 0; i--) {
    var sheet = sheets[i];
    var name = sheet.getName();

    if (keep.indexOf(name) !== -1) {
      continue;
    }

    if (sheet.getLastRow() !== 0 || sheet.getLastColumn() !== 0) {
      continue;
    }

    if (!/^(Feuille|Sheet)\s*\d+$/i.test(name)) {
      continue;
    }

    ss.deleteSheet(sheet);
    removed++;
  }

  return removed;
}

function repairLeads() {
  repairLeadsSheet_();
}

function repairDashboard() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DASHBOARD_SHEET);
  if (sheet) {
    applyDashboardLayout_(sheet);
  }
  refreshDashboardValues_();
}

function clearEventsData_() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EVENTS_SHEET);
  if (!sheet) {
    return 0;
  }

  var removed = Math.max(0, sheet.getLastRow() - 1);
  sheet.clear();
  sheet.appendRow(EVENT_HEADERS);
  return removed;
}

function clearLeadsData_() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LEADS_SHEET);
  if (!sheet) {
    return 0;
  }

  var removed = Math.max(0, sheet.getLastRow() - 1);
  sheet.clear();
  sheet.appendRow(LEAD_HEADERS);
  return removed;
}

function resetTestData() {
  ensureWorkbook_();
  var eventsRemoved = clearEventsData_();
  var leadsRemoved = clearLeadsData_();
  repairDashboard();

  return {
    eventsRemoved: eventsRemoved,
    leadsRemoved: leadsRemoved,
    message: "Events et Leads réinitialisés. Dashboard remis à zéro."
  };
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("ISS Landing Pages")
    .addItem("Réinitialiser données de test", "resetTestData")
    .addItem("Recalculer le Dashboard", "repairDashboard")
    .addSeparator()
    .addItem("Réparation complète", "setupAll")
    .addToUi();
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
