(function () {
  var form = document.getElementById("header-subscribe-form");
  if (!form) return;

  // Short pause after the email field is touched. Instant scripted submits are
  // blocked; real subscribers only see a brief delay if they click too fast.
  var MIN_INTERACTION_MS = 600;
  var trapField = form.querySelector("#header-bd-trap");
  var emailField = form.querySelector("#header-bd-email");
  var submitButton = form.querySelector(".header-cta__button");
  var interactedAt = 0;
  var allowSubmit = false;

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    submitButton.classList.toggle("header-cta__button--submitting", isSubmitting);
  }

  function markInteracted() {
    if (!interactedAt) interactedAt = Date.now();
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
    emailField.addEventListener("focus", markInteracted);
    emailField.addEventListener("input", markInteracted);
    emailField.addEventListener("change", markInteracted);
  }

  // Autofill + click often skips focus/input; a real pointer on Subscribe counts.
  // element.click() from scripts typically does not fire pointerdown.
  if (submitButton) {
    submitButton.addEventListener("pointerdown", function () {
      if (!emailField || !emailField.value) return;
      if (!interactedAt) {
        interactedAt = Date.now() - MIN_INTERACTION_MS;
      }
    });
  }

  form.addEventListener("submit", function (event) {
    if (allowSubmit) return;

    // Hidden trap: real people never see it; naive bots often fill every input.
    if (trapField && trapField.value) {
      event.preventDefault();
      return;
    }

    // Autofill may populate the email without focus/input events.
    if (!interactedAt && emailField && emailField.value) {
      markInteracted();
    }

    // Blind programmatic submit with no email interaction.
    if (!interactedAt) {
      event.preventDefault();
      return;
    }

    var remaining = MIN_INTERACTION_MS - (Date.now() - interactedAt);
    if (remaining > 0) {
      event.preventDefault();
      setSubmitting(true);
      window.setTimeout(nativeSubmit, remaining);
      return;
    }

    setSubmitting(true);
  });
})();
