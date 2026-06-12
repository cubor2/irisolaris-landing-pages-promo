(function () {
  var config = window.ISS_CONFIG;
  var form = document.getElementById("lead-form");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".form-step"));
  var progressFill = document.getElementById("progress-fill");
  var progressLabel = document.getElementById("progress-label");
  var prevBtn = document.getElementById("btn-prev");
  var nextBtn = document.getElementById("btn-next");
  var formPanel = document.getElementById("form-panel");
  var successPanel = document.getElementById("success-panel");
  var errorBanner = document.getElementById("form-error");
  var currentStep = 0;
  var hasSubmitted = false;
  var formStartTracked = false;
  var utmParams = getUtmParams();

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || ""
    };
  }

  function updateStepUI() {
    steps.forEach(function (step, index) {
      step.hidden = index !== currentStep;
      step.classList.toggle("is-active", index === currentStep);
    });

    var progress = ((currentStep + 1) / steps.length) * 100;
    progressFill.style.width = progress + "%";
    progressLabel.textContent = "Étape " + (currentStep + 1) + " sur " + steps.length;

    prevBtn.hidden = currentStep === 0;
    nextBtn.hidden = false;
    nextBtn.textContent = currentStep === steps.length - 1 ? "Envoyer ma demande" : "Continuer";
  }

  function getActiveStepElement() {
    return steps[currentStep];
  }

  function validateStep(stepIndex) {
    var step = steps[stepIndex == null ? currentStep : stepIndex];
    var fields = step.querySelectorAll("input:not([type='radio']), select, textarea");
    var radioGroups = {};
    var valid = true;

    step.querySelectorAll("input[type='radio'][required]").forEach(function (radio) {
      radioGroups[radio.name] = true;
    });

    Object.keys(radioGroups).forEach(function (name) {
      var checked = step.querySelector('input[type="radio"][name="' + name + '"]:checked');
      var groupField = step.querySelector('input[type="radio"][name="' + name + '"]');
      if (!checked && groupField) {
        valid = false;
        showFieldError(groupField);
      }
    });

    fields.forEach(function (field) {
      clearFieldError(field);
      if (!field.checkValidity()) {
        valid = false;
        showFieldError(field);
      }
    });

    return valid;
  }

  function validateAllSteps() {
    var firstInvalidStep = -1;

    for (var i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        firstInvalidStep = i;
        break;
      }
    }

    if (firstInvalidStep !== -1) {
      currentStep = firstInvalidStep;
      updateStepUI();
      showFormError("Merci de compléter les champs obligatoires.");
      return false;
    }

    hideFormError();
    return true;
  }

  function getFieldWrapper(field) {
    return field.closest(".field");
  }

  function showFieldError(field) {
    var wrapper = getFieldWrapper(field);
    if (!wrapper) {
      return;
    }

    if (field.type === "radio") {
      wrapper.querySelectorAll('input[type="radio"][name="' + field.name + '"]').forEach(function (radio) {
        radio.classList.add("is-invalid");
      });
    } else {
      field.classList.add("is-invalid");
    }

    var error = wrapper.querySelector(".field-error");
    if (error) {
      error.classList.add("is-visible");
      error.hidden = false;
    }
  }

  function clearFieldError(field) {
    var wrapper = getFieldWrapper(field);
    if (!wrapper) {
      return;
    }

    if (field.type === "radio") {
      wrapper.querySelectorAll('input[type="radio"][name="' + field.name + '"]').forEach(function (radio) {
        radio.classList.remove("is-invalid");
      });
    } else {
      field.classList.remove("is-invalid");
    }

    var error = wrapper.querySelector(".field-error");
    if (error) {
      error.classList.remove("is-visible");
      error.hidden = true;
    }
  }

  function syncFormErrorBanner() {
    var step = getActiveStepElement();
    var hasVisibleErrors = step.querySelector(".field-error.is-visible");
    if (!hasVisibleErrors) {
      hideFormError();
    }
  }

  function hideMobileCta() {
    var cta = document.getElementById("mobile-cta");
    if (cta) {
      cta.hidden = true;
    }
    document.body.classList.add("iss-form-active");
  }

  function celebrateSuccess() {
    if (typeof confetti !== "function") {
      return;
    }

    var colors = ["#2377ff", "#ff610b", "#06244c", "#ffffff"];

    confetti({
      particleCount: 80,
      spread: 68,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.58 },
      colors: colors,
      disableForReducedMotion: true
    });

    window.setTimeout(function () {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 52,
        origin: { x: 0.12, y: 0.62 },
        colors: colors,
        disableForReducedMotion: true
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 52,
        origin: { x: 0.88, y: 0.62 },
        colors: colors,
        disableForReducedMotion: true
      });
    }, 160);
  }

  function handleFieldFocus(field) {
    if (!formStartTracked) {
      formStartTracked = true;
      trackFormEvent("form_start");
      hideMobileCta();
    }
    clearFieldError(field);
    syncFormErrorBanner();
  }

  function handleFieldInput(field) {
    clearFieldError(field);
    syncFormErrorBanner();
  }

  function showFormError(message) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  }

  function hideFormError() {
    errorBanner.hidden = true;
    errorBanner.textContent = "";
  }

  function collectFormData(isComplete) {
    var data = new FormData(form);
    var payload = {};

    data.forEach(function (value, key) {
      payload[key] = value;
    });

    payload.landing_id = config.landingId;
    payload.landing_label = config.landingLabel;
    payload.page_url = window.location.href;
    payload.user_agent = navigator.userAgent;

    Object.keys(utmParams).forEach(function (key) {
      payload[key] = utmParams[key];
    });

    var consent = form.querySelector('[name="consentement_rgpd"]');
    payload.consentement_rgpd = consent && consent.checked ? "oui" : "non";

    if (isComplete) {
      payload.form_complete = "oui";
      payload.record_type = "lead";
    }

    if (window.ISS_stats && window.ISS_stats.getSessionId) {
      payload.session_id = window.ISS_stats.getSessionId();
    }

    return payload;
  }

  function trackFormEvent(eventType, extra) {
    if (window.ISS_stats && window.ISS_stats.track) {
      window.ISS_stats.track(eventType, extra);
    }
  }

  function submitViaHiddenForm(payload) {
    return new Promise(function (resolve) {
      var iframeName = "iss-lead-frame";
      var iframe = document.getElementById(iframeName);

      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = iframeName;
        iframe.id = iframeName;
        iframe.hidden = true;
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);
      }

      var tempForm = document.createElement("form");
      tempForm.method = "POST";
      tempForm.action = config.sheetWebAppUrl;
      tempForm.target = iframeName;
      tempForm.acceptCharset = "UTF-8";
      tempForm.style.display = "none";

      Object.keys(payload).forEach(function (key) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = payload[key] == null ? "" : String(payload[key]);
        tempForm.appendChild(input);
      });

      document.body.appendChild(tempForm);

      var finished = false;
      function finish() {
        if (finished) {
          return;
        }
        finished = true;
        if (tempForm.parentNode) {
          tempForm.parentNode.removeChild(tempForm);
        }
        resolve(true);
      }

      iframe.addEventListener("load", finish, { once: true });
      tempForm.submit();
      setTimeout(finish, 5000);
    });
  }

  async function submitLead() {
    if (hasSubmitted) {
      return false;
    }

    if (!config.sheetWebAppUrl) {
      showFormError("Configuration manquante : URL Google Sheet non renseignée.");
      return false;
    }

    if (!validateAllSteps()) {
      return false;
    }

    hasSubmitted = true;
    nextBtn.disabled = true;
    nextBtn.textContent = "Envoi en cours…";

    try {
      trackFormEvent("form_complete");
      await submitViaHiddenForm(collectFormData(true));

      hideMobileCta();
      formPanel.hidden = true;
      successPanel.hidden = false;
      successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      celebrateSuccess();
      return true;
    } catch (error) {
      hasSubmitted = false;
      showFormError("Une erreur est survenue. Réessayez ou appelez-nous directement.");
      return false;
    } finally {
      nextBtn.disabled = false;
      nextBtn.textContent = "Envoyer ma demande";
    }
  }

  prevBtn.addEventListener("click", function () {
    if (currentStep > 0) {
      currentStep -= 1;
      updateStepUI();
      hideFormError();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (currentStep === steps.length - 1) {
      submitLead();
      return;
    }

    if (!validateStep()) {
      showFormError("Merci de compléter les champs obligatoires.");
      return;
    }

    currentStep += 1;
    updateStepUI();
    hideFormError();
    trackFormEvent("form_step", { form_step: currentStep + 1 });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  document.querySelectorAll('[data-scroll="form"]').forEach(function (button) {
    button.addEventListener("click", function () {
      if (button.closest("#mobile-cta")) {
        hideMobileCta();
      }
      document.getElementById("devis").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("focus", function () {
      handleFieldFocus(field);
    });

    field.addEventListener("click", function () {
      handleFieldFocus(field);
    });

    field.addEventListener("input", function () {
      handleFieldInput(field);
    });

    field.addEventListener("change", function () {
      handleFieldInput(field);
    });
  });

  updateStepUI();
})();
