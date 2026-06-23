(function () {
  var COLUMN_TYPES = ["text", "number", "number", "text"];

  function compareCellValues(a, b, type) {
    if (type === "number") {
      var na = a === "—" || a === "" ? NaN : Number(a);
      var nb = b === "—" || b === "" ? NaN : Number(b);
      if (isNaN(na) && isNaN(nb)) {
        return 0;
      }
      if (isNaN(na)) {
        return 1;
      }
      if (isNaN(nb)) {
        return -1;
      }
      return na - nb;
    }
    return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
  }

  function rowMatchesSearch(row, query) {
    if (!query) {
      return true;
    }
    var q = query.toLowerCase();
    return Array.from(row.cells).some(function (cell) {
      return cell.textContent.toLowerCase().indexOf(q) !== -1;
    });
  }

  function enhanceSection(section) {
    var table = section.querySelector(".energy-gel-ratings-table");
    if (!table) {
      return;
    }

    var tbody = table.querySelector("tbody");
    var headerRow = table.querySelector("thead tr");
    if (!tbody || !headerRow) {
      return;
    }

    var dataRows = Array.from(tbody.querySelectorAll("tr"));
    var state = {
      sortKey: 1,
      sortDir: "desc",
      search: "",
    };

    var controls = document.createElement("div");
    controls.className = "energy-gel-table-controls";

    var searchLabel = document.createElement("label");
    searchLabel.className = "energy-gel-search-label";
    searchLabel.textContent = "Search / Filter: ";

    var searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "energy-gel-search-input";
    searchInput.setAttribute("aria-controls", table.id || "");
    searchInput.addEventListener("input", function () {
      state.search = searchInput.value.trim();
      apply();
    });

    searchLabel.appendChild(searchInput);
    controls.appendChild(searchLabel);
    section.insertBefore(controls, table.closest(".energy-gel-table-scroll") || table);

    var emptyRow = document.createElement("tr");
    emptyRow.className = "energy-gel-empty-row";
    emptyRow.hidden = true;
    var emptyCell = document.createElement("td");
    emptyCell.colSpan = 4;
    emptyCell.className = "energy-gel-empty";
    emptyCell.textContent = "No matching records found.";
    emptyRow.appendChild(emptyCell);

    function updateSortIndicators() {
      headerRow.querySelectorAll(".energy-gel-sortable").forEach(function (th) {
        var key = Number(th.dataset.sortKey);
        var indicator = th.querySelector(".energy-gel-sort-indicator");
        if (key === state.sortKey) {
          indicator.textContent = state.sortDir === "asc" ? "▲" : "▼";
          th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
        } else {
          indicator.textContent = "";
          th.removeAttribute("aria-sort");
        }
      });
    }

    function apply() {
      var visible = dataRows.filter(function (row) {
        var show = rowMatchesSearch(row, state.search);
        row.hidden = !show;
        return show;
      });

      var sortType = COLUMN_TYPES[state.sortKey] || "text";
      visible.sort(function (ra, rb) {
        var a = ra.cells[state.sortKey].textContent.trim();
        var b = rb.cells[state.sortKey].textContent.trim();
        var cmp = compareCellValues(a, b, sortType);
        return state.sortDir === "asc" ? cmp : -cmp;
      });

      visible.forEach(function (row) {
        tbody.appendChild(row);
      });

      if (visible.length === 0) {
        if (!emptyRow.parentNode) {
          tbody.appendChild(emptyRow);
        }
        emptyRow.hidden = false;
      } else if (emptyRow.parentNode) {
        emptyRow.hidden = true;
      }
    }

    function toggleSort(key) {
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === 1 || key === 2 ? "desc" : "asc";
      }
      updateSortIndicators();
      apply();
    }

    headerRow.querySelectorAll(".energy-gel-sortable").forEach(function (th) {
      th.addEventListener("click", function () {
        toggleSort(Number(th.dataset.sortKey));
      });
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleSort(Number(th.dataset.sortKey));
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("energy-gel-ratings-root");
    if (!root) {
      return;
    }
    root.querySelectorAll(".energy-gel-type-section").forEach(enhanceSection);
  });
})();
