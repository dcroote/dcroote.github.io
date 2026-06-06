(function () {
  var cfg = window.__SUPABASE__;
  if (!cfg || !cfg.url || !cfg.publishableKey) {
    return;
  }

  var VOTER_KEY = "likes_voter_id";
  var LIKED_PREFIX = "liked:";

  function voterId() {
    try {
      var id = localStorage.getItem(VOTER_KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(VOTER_KEY, id);
      }
      return id;
    } catch (e) {
      return crypto.randomUUID();
    }
  }

  function likedKey(postId) {
    return LIKED_PREFIX + postId;
  }

  function isLiked(postId) {
    try {
      return localStorage.getItem(likedKey(postId)) === "1";
    } catch (e) {
      return false;
    }
  }

  function setLiked(postId) {
    try {
      localStorage.setItem(likedKey(postId), "1");
    } catch (e) {
      /* private mode */
    }
  }

  function rpc(name, body) {
    return fetch(cfg.url + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        apikey: cfg.publishableKey,
        Authorization: "Bearer " + cfg.publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          var detail = text;
          try {
            var j = JSON.parse(text);
            if (j && j.message) {
              detail = j.message;
            }
          } catch (e) {
            /* keep raw body */
          }
          throw new Error("rpc " + name + " failed: " + detail);
        });
      }
      return res.json();
    });
  }

  function widgetsForPost(postId) {
    var widgets = [];
    document.querySelectorAll("[data-like-post]").forEach(function (widget) {
      if (widget.getAttribute("data-post-id") === postId) {
        widgets.push(widget);
      }
    });
    return widgets;
  }

  function setCount(countEl, btn, n) {
    if (typeof n === "number" && n >= 0 && isFinite(n)) {
      countEl.textContent = String(Math.floor(n));
      btn.setAttribute("aria-label", "Like, " + n + " likes");
    } else {
      countEl.textContent = "\u2014";
      btn.setAttribute("aria-label", "Like this post");
    }
  }

  function setCountForPost(postId, n) {
    widgetsForPost(postId).forEach(function (widget) {
      var countEl = widget.querySelector(".like-count");
      var btn = widget.querySelector(".like-button");
      if (countEl && btn) {
        setCount(countEl, btn, n);
      }
    });
  }

  function setButtonState(btn, liked) {
    btn.disabled = liked;
    btn.setAttribute("aria-pressed", liked ? "true" : "false");
    btn.classList.toggle("like-button--active", liked);
  }

  function setButtonStateForPost(postId, liked) {
    widgetsForPost(postId).forEach(function (widget) {
      var btn = widget.querySelector(".like-button");
      if (btn) {
        setButtonState(btn, liked);
      }
    });
  }

  function initWidget(widget) {
    var postId = widget.getAttribute("data-post-id");
    if (!postId) {
      return;
    }

    var btn = widget.querySelector(".like-button");
    var countEl = widget.querySelector(".like-count");
    if (!btn || !countEl) {
      return;
    }

    setButtonStateForPost(postId, isLiked(postId));

    rpc("get_like_count", { p_post_id: postId })
      .then(function (count) {
        setCountForPost(postId, count);
      })
      .catch(function () {
        setCountForPost(postId, NaN);
        setButtonStateForPost(postId, isLiked(postId));
      });

    btn.addEventListener("click", function () {
      if (btn.disabled || isLiked(postId)) {
        return;
      }

      setButtonStateForPost(postId, true);

      rpc("increment_like", {
        p_post_id: postId,
        p_voter_key: voterId(),
      })
        .then(function (result) {
          if (result) {
            if (typeof result.count === "number") {
              setCountForPost(postId, result.count);
            }
            setLiked(postId);
          }
          setButtonStateForPost(postId, isLiked(postId));
        })
        .catch(function () {
          setButtonStateForPost(postId, isLiked(postId));
        });
    });
  }

  document.querySelectorAll("[data-like-post]").forEach(initWidget);
})();
