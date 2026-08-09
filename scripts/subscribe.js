(function () {
  var form = document.getElementById("header-subscribe-form");
  if (!form) return;

  var SETTLE_MS = 600;
  var companyField = form.querySelector("#header-bd-company");
  var emailField = form.querySelector("#header-bd-email");
  var submitButton = form.querySelector(".header-cta__button");
  var readyAt = 0;
  var allowSubmit = false;

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    submitButton.classList.toggle("header-cta__button--submitting", isSubmitting);
  }

  function markReady() {
    if (!readyAt) readyAt = Date.now();
  }

  function nativeSubmit() {
    allowSubmit = true;
    setSubmitting(true);
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      HTMLFormElement.prototype.submit.call(form);
    }
  }

  if (emailField) {
    emailField.addEventListener("focus", markReady);
    emailField.addEventListener("input", markReady);
    emailField.addEventListener("change", markReady);
  }

  // Password managers may fill the email without focus/input events.
  if (submitButton) {
    submitButton.addEventListener("pointerdown", function () {
      if (!emailField || !emailField.value) return;
      if (!readyAt) {
        readyAt = Date.now() - SETTLE_MS;
      }
    });
  }

  form.addEventListener("submit", function (event) {
    if (allowSubmit) return;

    if (companyField && companyField.value) {
      event.preventDefault();
      return;
    }

    if (!readyAt && emailField && emailField.value) {
      markReady();
    }

    if (!readyAt) {
      event.preventDefault();
      return;
    }

    var remaining = SETTLE_MS - (Date.now() - readyAt);
    if (remaining > 0) {
      event.preventDefault();
      setSubmitting(true);
      window.setTimeout(nativeSubmit, remaining);
      return;
    }

    setSubmitting(true);
  });
})();
