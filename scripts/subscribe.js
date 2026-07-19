(function () {
  var form = document.getElementById("header-subscribe-form");
  if (!form) return;

  var readyAt = Date.now() + 1200;
  var companyField = form.querySelector("#header-bd-company");

  form.addEventListener("submit", function (event) {
    if (companyField && companyField.value) {
      event.preventDefault();
      return;
    }
    if (Date.now() < readyAt) {
      event.preventDefault();
    }
  });
})();
