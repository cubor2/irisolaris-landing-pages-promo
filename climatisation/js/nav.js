(function () {
  var nav = document.getElementById("iss-nav");
  var toggle = document.getElementById("nav-toggle");
  var header = document.getElementById("iss-header");
  var dropdownItems = document.querySelectorAll(".iss-nav__item--dropdown");

  function setNavOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    if (header) {
      header.classList.toggle("is-open", isOpen);
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    document.body.classList.toggle("iss-nav-open", isOpen);
  }

  function closeAllDropdowns(except) {
    dropdownItems.forEach(function (item) {
      if (item === except) {
        return;
      }
      item.classList.remove("is-open");
      var btn = item.querySelector(".iss-nav__link");
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = !header.classList.contains("is-open");
      setNavOpen(isOpen);
      if (!isOpen) {
        closeAllDropdowns(null);
      }
    });
  }

  dropdownItems.forEach(function (item) {
    var trigger = item.querySelector(".iss-nav__link");
    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      var willOpen = !item.classList.contains("is-open");
      closeAllDropdowns(willOpen ? item : null);
      item.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  nav.querySelectorAll(".iss-nav__panel-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      setNavOpen(false);
      closeAllDropdowns(null);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".iss-nav")) {
      closeAllDropdowns(null);
    }
  });
})();
