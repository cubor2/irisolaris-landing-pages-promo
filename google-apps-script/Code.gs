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

var DASHBOARD_ROWS = [
  {
    label: "Visiteurs (sessions uniques)",
    help: "Nombre de visiteurs différents sur la page. Chaque personne est comptée une fois par visite (session). Comptabilisé uniquement si le visiteur accepte les cookies analytics."
  },
  {
    label: "Pages vues",
    help: "Nombre total de fois où la page a été ouverte ou rechargée, toutes sessions confondues."
  },
  {
    label: "Temps moyen sur la page (secondes)",
    help: "Durée moyenne passée sur la landing page, calculée au moment où le visiteur quitte la page (fermeture de l'onglet ou navigation ailleurs)."
  },
  {
    label: "Formulaires démarrés",
    help: "Nombre de visiteurs ayant commencé à remplir le formulaire (clic ou saisie dans au moins un champ), même s'ils ne l'ont pas envoyé."
  },
  {
    label: "Inscriptions (leads)",
    help: "Nombre de demandes de devis complètes et validées, enregistrées dans l'onglet Leads (formulaire entièrement rempli + consentement RGPD)."
  },
  {
    label: "Taux de conversion",
    help: "Part des visiteurs devenus leads. Calcul : Inscriptions ÷ Visiteurs. Exemple : 3 inscriptions pour 100 visiteurs = 3 %."
  },
  {
    label: "Taux d'abandon formulaire",
    help: "Part des visiteurs ayant commencé le formulaire sans l'envoyer. Calcul : (Formulaires démarrés − Inscriptions) ÷ Formulaires démarrés."
  },
  {
    label: "Taux de sortie sans formulaire",
    help: "Part des visiteurs partis sans interagir avec le formulaire. Calcul : (Visiteurs − Formulaires démarrés) ÷ Visiteurs."
  },
  {
    label: "Visites courtes (< 30 s)",
    help: "Nombre de sessions de moins de 30 secondes sur la page. Indique les visites très brèves (consultation rapide ou rebond)."
  },
  {
    label: "Inscriptions (7 derniers jours)",
    help: "Nombre de leads enregistrés sur les 7 derniers jours glissants (à partir d'aujourd'hui)."
  },
  {
    label: "Dernière inscription",
    help: "Date et heure de la demande de devis la plus récente enregistrée dans l'onglet Leads."
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

function ensureDashboardLayout_(sheet) {
  var isReady = sheet.getRange("A1").getValue() === "Tableau de bord — Landing Pages Promo" &&
    sheet.getRange("C4").getValue() === "Comment c'est calculé";

  if (!isReady) {
    applyDashboardLayout_(sheet);
  }
}

function applyDashboardLayout_(sheet) {
  sheet.clear();

  var rows = [
    ["Tableau de bord — Landing Pages Promo", "", ""],
    ["Mis à jour automatiquement à partir des onglets Events et Leads", "", ""],
    ["", "", ""],
    ["Indicateur", "Valeur", "Comment c'est calculé"]
  ];

  DASHBOARD_ROWS.forEach(function (item) {
    rows.push([item.label, "", item.help]);
  });

  sheet.getRange(1, 1, rows.length, 3).setValues(rows);
  sheet.getRange("A1:C1").merge();
  sheet.getRange("A2:C2").merge();
  sheet.getRange("A1").setFontSize(14).setFontWeight("bold");
  sheet.getRange("A2").setFontSize(10).setFontColor("#5a6b7d");
  sheet.getRange("A4:C4").setFontWeight("bold").setBackground("#f4f7fb");
  sheet.getRange("C5:C" + rows.length).setFontColor("#5a6b7d").setFontSize(10).setWrap(true);
  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 480);
  sheet.setFrozenRows(4);
}

function computeDashboardMetrics_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var eventsSheet = ss.getSheetByName(EVENTS_SHEET);
  var leadsSheet = ss.getSheetByName(LEADS_SHEET);
  var events = [];
  var pageviewSessions = {};
  var formStartSessions = {};
  var pageviews = 0;
  var durations = [];
  var shortVisits = 0;

  if (eventsSheet && eventsSheet.getLastRow() > 1) {
    events = eventsSheet.getRange(2, 1, eventsSheet.getLastRow(), eventsSheet.getLastColumn()).getValues();
  }

  events.forEach(function (row) {
    var type = String(row[1] || "");
    var session = String(row[2] || "");

    if (type === "pageview") {
      pageviews++;
      if (session) {
        pageviewSessions[session] = true;
      }
    }

    if (type === "form_start" && session) {
      formStartSessions[session] = true;
    }

    if (type === "session_end") {
      var duration = parseFloat(row[5]);
      if (!isNaN(duration)) {
        durations.push(duration);
        if (duration < 30) {
          shortVisits++;
        }
      }
    }
  });

  var uniqueVisitors = Object.keys(pageviewSessions).length;
  var formStarts = Object.keys(formStartSessions).length;
  var avgDuration = 0;

  if (durations.length > 0) {
    var total = durations.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    avgDuration = Math.round(total / durations.length);
  }

  var leadCount = 0;
  var leadsLast7Days = 0;
  var lastLeadDate = null;
  var now = new Date();
  var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (leadsSheet && leadsSheet.getLastRow() > 1) {
    var headers = leadsSheet.getRange(1, 1, 1, leadsSheet.getLastColumn()).getValues()[0];
    var emailCol = headers.indexOf("Email");
    var rows = leadsSheet.getRange(2, 1, leadsSheet.getLastRow(), leadsSheet.getLastColumn()).getValues();

    rows.forEach(function (row) {
      if (emailCol === -1 || !String(row[emailCol] || "").trim()) {
        return;
      }

      leadCount++;

      var date = row[0];
      if (date instanceof Date) {
        if (date >= sevenDaysAgo) {
          leadsLast7Days++;
        }
        if (!lastLeadDate || date > lastLeadDate) {
          lastLeadDate = date;
        }
      }
    });
  }

  return {
    visitors: uniqueVisitors,
    pageviews: pageviews,
    avgDuration: avgDuration,
    formStarts: formStarts,
    leads: leadCount,
    conversion: uniqueVisitors > 0 ? leadCount / uniqueVisitors : 0,
    formAbandon: formStarts > 0 ? (formStarts - leadCount) / formStarts : 0,
    exitNoForm: uniqueVisitors > 0 ? (uniqueVisitors - formStarts) / uniqueVisitors : 0,
    shortVisits: shortVisits,
    leadsLast7Days: leadsLast7Days,
    lastLeadDate: lastLeadDate
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

  sheet.getRange("B5").setValue(metrics.visitors);
  sheet.getRange("B6").setValue(metrics.pageviews);
  sheet.getRange("B7").setValue(metrics.avgDuration);
  sheet.getRange("B8").setValue(metrics.formStarts);
  sheet.getRange("B9").setValue(metrics.leads);
  sheet.getRange("B10").setValue(metrics.conversion);
  sheet.getRange("B11").setValue(metrics.formAbandon);
  sheet.getRange("B12").setValue(metrics.exitNoForm);
  sheet.getRange("B13").setValue(metrics.shortVisits);
  sheet.getRange("B14").setValue(metrics.leadsLast7Days);
  sheet.getRange("B15").setValue(metrics.lastLeadDate || "");

  sheet.getRange("B10:B12").setNumberFormat("0.0%");
  sheet.getRange("B15").setNumberFormat("dd/mm/yyyy hh:mm");
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

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
