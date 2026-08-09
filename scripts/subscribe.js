(function () {
  var form = document.getElementById("header-subscribe-form");
  if (!form) return;

  var companyField = form.querySelector("#header-bd-company");
  var emailField = form.querySelector("#header-bd-email");
  var submitButton = form.querySelector(".header-cta__button");
  var status = form.querySelector("#header-subscribe-status");
  var turnstileContainer = form.querySelector("#header-subscribe-turnstile");
  var subscribeUrl = form.getAttribute("data-subscribe-url");
  var successUrl = form.getAttribute("data-success-url");
  var turnstileAction = form.getAttribute("data-turnstile-action");
  var turnstileSiteKey = form.getAttribute("data-turnstile-site-key");
  var turnstileScriptPromise;
  var turnstileWidgetId;

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    if (emailField) emailField.disabled = isSubmitting;
    submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    submitButton.classList.toggle("header-cta__button--submitting", isSubmitting);
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function showTurnstile(isVisible) {
    if (!turnstileContainer) return;
    turnstileContainer.classList.toggle(
      "header-subscribe-turnstile--visible",
      isVisible,
    );
  }

  function resetAfterError(message) {
    setSubmitting(false);
    showTurnstile(false);
    setStatus(message);
    if (window.turnstile && turnstileWidgetId !== undefined) {
      window.turnstile.reset(turnstileWidgetId);
    }
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileScriptPromise) return turnstileScriptPromise;

    turnstileScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = function () {
        if (window.turnstile) {
          resolve(window.turnstile);
        } else {
          reject(new Error("Turnstile did not initialize"));
        }
      };
      script.onerror = function () {
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(script);
    });

    return turnstileScriptPromise;
  }

  function submitToWorker(token) {
    return fetch(subscribeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailField ? emailField.value : "",
        company: companyField ? companyField.value : "",
        turnstileToken: token,
      }),
    }).then(function (response) {
      if (response.ok) {
        window.location.assign(successUrl);
        return;
      }

      if (response.status === 429) {
        throw new Error("rate_limit");
      }
      throw new Error("subscription_failed");
    });
  }

  function executeTurnstile(turnstile) {
    if (turnstileWidgetId === undefined) {
      turnstileWidgetId = turnstile.render(turnstileContainer, {
        sitekey: turnstileSiteKey,
        action: turnstileAction,
        appearance: "interaction-only",
        execution: "execute",
        size: "flexible",
        "response-field": false,
        callback: function (token) {
          submitToWorker(token).catch(function (error) {
            var message =
              error.message === "rate_limit"
                ? "Please wait a minute, then try again."
                : "Could not subscribe. Please try again.";
            resetAfterError(message);
          });
        },
        "before-interactive-callback": function () {
          showTurnstile(true);
        },
        "after-interactive-callback": function () {
          showTurnstile(false);
        },
        "error-callback": function () {
          resetAfterError("Verification failed. Please try again.");
        },
        "expired-callback": function () {
          resetAfterError("Verification expired. Please try again.");
        },
        "timeout-callback": function () {
          resetAfterError("Verification timed out. Please try again.");
        },
      });
    }

    turnstile.execute(turnstileWidgetId);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (companyField && companyField.value) {
      window.location.assign(successUrl);
      return;
    }

    if (!subscribeUrl || !turnstileSiteKey) {
      setStatus("Email subscriptions are temporarily unavailable.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    loadTurnstile()
      .then(executeTurnstile)
      .catch(function () {
        resetAfterError("Verification could not load. Please try again.");
      });
  });
})();
