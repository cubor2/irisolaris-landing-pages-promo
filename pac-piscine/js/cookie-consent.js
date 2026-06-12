(function () {
  var STORAGE_KEY = "cookieyes-consent";
  var COOKIE_NAME = "cookieyes-consent";
  var EXPIRY_DAYS = 365;

  var root = document.getElementById("iss-cookie-root");
  if (!root) {
    return;
  }

  var overlay = root.querySelector(".cky-overlay");
  var banner = root.querySelector(".cky-consent-container");
  var modal = root.querySelector(".cky-modal");
  var revisit = root.querySelector(".cky-btn-revisit-wrapper");
  var toggles = {
    functional: root.querySelector("#ckySwitchfunctional"),
    analytics: root.querySelector("#ckySwitchanalytics")
  };

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (error) {}

    var match = document.cookie.match(new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)"));
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch (error) {
      return null;
    }
  }

  function writeConsent(data) {
    var value = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, value);
    var expires = new Date();
    expires.setDate(expires.getDate() + EXPIRY_DAYS);
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(value) + "; expires=" + expires.toUTCString() + "; path=/; SameSite=Lax";
    window.dispatchEvent(new CustomEvent("issCookieConsent", { detail: data }));
  }

  function buildConsent(action, prefs) {
    return {
      consent: true,
      action: action,
      necessary: true,
      functional: !!prefs.functional,
      analytics: !!prefs.analytics,
      timestamp: Date.now()
    };
  }

  function hideBanner() {
    banner.classList.add("cky-hide");
  }

  function showBanner() {
    banner.classList.remove("cky-hide");
  }

  function hideModal() {
    modal.classList.add("cky-hide");
    overlay.classList.add("cky-hide");
    document.body.style.overflow = "";
  }

  function showModal() {
    modal.classList.remove("cky-hide");
    overlay.classList.remove("cky-hide");
    document.body.style.overflow = "hidden";
  }

  function showRevisit() {
    revisit.classList.remove("cky-revisit-hide");
    banner.classList.add("has-revisit-offset");
  }

  function applyConsent(data) {
    toggles.functional.checked = data.functional;
    toggles.analytics.checked = data.analytics;
    hideBanner();
    hideModal();
    showRevisit();
  }

  function saveConsent(action, prefs) {
    var data = buildConsent(action, prefs);
    writeConsent(data);
    applyConsent(data);
  }

  function syncToggleStates() {
    toggles.functional.checked = true;
    toggles.analytics.checked = false;
  }

  root.querySelector(".cky-consent-container .cky-btn-accept").addEventListener("click", function () {
    saveConsent("accept", { functional: true, analytics: true });
  });

  root.querySelector(".cky-consent-container .cky-btn-reject").addEventListener("click", function () {
    saveConsent("reject", { functional: false, analytics: false });
  });

  root.querySelector('[data-cky-tag="settings-button"]').addEventListener("click", function () {
    syncToggleStates();
    showModal();
  });

  root.querySelector('[data-cky-tag="detail-close"]').addEventListener("click", hideModal);

  overlay.addEventListener("click", hideModal);

  root.querySelector('[data-cky-tag="detail-accept-button"]').addEventListener("click", function () {
    saveConsent("accept", { functional: true, analytics: true });
  });

  root.querySelector('[data-cky-tag="detail-reject-button"]').addEventListener("click", function () {
    saveConsent("reject", { functional: false, analytics: false });
  });

  root.querySelector('[data-cky-tag="detail-save-button"]').addEventListener("click", function () {
    saveConsent("custom", {
      functional: toggles.functional.checked,
      analytics: toggles.analytics.checked
    });
  });

  revisit.querySelector(".cky-btn-revisit").addEventListener("click", function () {
    var saved = readConsent();
    if (saved) {
      toggles.functional.checked = saved.functional;
      toggles.analytics.checked = saved.analytics;
    }
    showModal();
  });

  root.querySelectorAll(".cky-accordion-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var accordion = item.closest(".cky-accordion");
      accordion.classList.toggle("is-open");
    });
  });

  root.querySelectorAll(".cky-switch input").forEach(function (input) {
    input.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  });

  window.ISS_getAnalyticsConsent = function () {
    var saved = readConsent();
    return !!(saved && saved.analytics);
  };

  var savedConsent = readConsent();
  if (savedConsent && savedConsent.consent) {
    applyConsent(savedConsent);
    window.dispatchEvent(new CustomEvent("issCookieConsent", { detail: savedConsent }));
  } else {
    showBanner();
    revisit.classList.add("cky-revisit-hide");
  }
})();
