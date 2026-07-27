(function () {
  var config = window.ISS_CONFIG;
  var SESSION_KEY = "iss_session_id";
  var PAGEVIEW_KEY = "iss_pageview_sent";
  var pageStart = Date.now();
  var sessionEndSent = false;

  function getSessionId() {
    var id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function hasAnalyticsConsent() {
    if (typeof window.ISS_getAnalyticsConsent === "function") {
      return window.ISS_getAnalyticsConsent();
    }
    return false;
  }

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || ""
    };
  }

  function sendPayload(payload) {
    if (!config || !config.sheetWebAppUrl) {
      return;
    }

    var iframeName = "iss-stats-frame";
    var iframe = document.getElementById(iframeName);

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.id = iframeName;
      iframe.hidden = true;
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);
    }

    var form = document.createElement("form");
    form.method = "POST";
    form.action = config.sheetWebAppUrl;
    form.target = iframeName;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    Object.keys(payload).forEach(function (key) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = payload[key] == null ? "" : String(payload[key]);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  function buildEventPayload(eventType, extra) {
    var utm = getUtmParams();
    var payload = {
      record_type: "event",
      event_type: eventType,
      session_id: getSessionId(),
      landing_id: config.landingId,
      landing_label: config.landingLabel,
      page_url: window.location.href.split("#")[0],
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign
    };

    if (extra) {
      Object.keys(extra).forEach(function (key) {
        payload[key] = extra[key];
      });
    }

    return payload;
  }

  function track(eventType, extra) {
    if (!hasAnalyticsConsent()) {
      return;
    }
    sendPayload(buildEventPayload(eventType, extra));
  }

  function trackPageviewOnce() {
    if (!hasAnalyticsConsent()) {
      return;
    }
    if (sessionStorage.getItem(PAGEVIEW_KEY) === "1") {
      return;
    }
    sendPayload(buildEventPayload("pageview"));
    sessionStorage.setItem(PAGEVIEW_KEY, "1");
  }

  function sendSessionEnd() {
    if (sessionEndSent || !hasAnalyticsConsent()) {
      return;
    }
    sessionEndSent = true;
    var duration = Math.max(1, Math.round((Date.now() - pageStart) / 1000));
    sendPayload(buildEventPayload("session_end", { duration_seconds: duration }));
  }

  window.ISS_stats = {
    track: track,
    getSessionId: getSessionId
  };

  window.addEventListener("issCookieConsent", function (event) {
    if (event.detail && event.detail.analytics) {
      trackPageviewOnce();
    }
  });

  if (hasAnalyticsConsent()) {
    trackPageviewOnce();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      sendSessionEnd();
    }
  });

  window.addEventListener("pagehide", sendSessionEnd);
})();
