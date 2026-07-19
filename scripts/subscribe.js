(function () {
  var form = document.getElementById("header-subscribe-form");
  if (!form) return;

  var readyAt = Date.now() + 1200;
  var honeypot = form.querySelector("#header-bd-company");

  form.addEventListener("submit", function (event) {
    if (honeypot && honeypot.value) {
      event.preventDefault();
      return;
    }
    if (Date.now() < readyAt) {
      event.preventDefault();
    }
  });
})();
