(function () {
  var form = document.getElementById("header-subscribe-form");
  if (!form) return;

  var readyAt = Date.now() + 1200;
  var companyField = form.querySelector("#header-bd-company");
  var submitButton = form.querySelector(".header-cta__button");

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    submitButton.classList.toggle("header-cta__button--submitting", isSubmitting);
  }

  form.addEventListener("submit", function (event) {
    if (companyField && companyField.value) {
      event.preventDefault();
      return;
    }
    if (Date.now() < readyAt) {
      event.preventDefault();
      return;
    }
    setSubmitting(true);
  });
})();
