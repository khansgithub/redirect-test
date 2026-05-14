(function () {
  "use strict";

  var BASE_PATH = getBasePath();

  function getBasePath() {
    var meta = document.querySelector('meta[name="base-path"]');
    return meta ? meta.getAttribute("content") : "";
  }

  function getRequestedPath() {
    var fullPath = window.location.pathname;
    if (BASE_PATH && fullPath.startsWith(BASE_PATH)) {
      fullPath = fullPath.slice(BASE_PATH.length);
    }
    return fullPath.replace(/^\/+|\/+$/g, "").toLowerCase();
  }

  function initGoogleAnalytics(measurementId) {
    if (!measurementId || measurementId === "G-XXXXXXXXXX") return;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", measurementId);
  }

  function trackRedirect(path, destination) {
    if (window.gtag) {
      window.gtag("event", "redirect", {
        event_category: "navigation",
        event_label: path,
        redirect_destination: destination,
      });
    }
  }

  function showRedirecting(destination) {
    var el = document.getElementById("redirect-content");
    if (!el) return;
    el.innerHTML =
      '<div class="redirect-notice">' +
      '<div class="spinner"></div>' +
      "<h2>Redirecting&hellip;</h2>" +
      '<p>Taking you to <a href="' + destination + '">' + destination + "</a></p>" +
      "</div>";
  }

  function showNotFound(path) {
    var el = document.getElementById("redirect-content");
    if (!el) return;
    el.innerHTML =
      '<div class="not-found">' +
      "<h2>404</h2>" +
      "<p>No redirect configured for <code>/" + path + "</code></p>" +
      '<a href="' + BASE_PATH + '/">← View all redirects</a>' +
      "</div>";
  }

  function performRedirect(config) {
    var path = getRequestedPath();

    if (!path) {
      window.location.replace(BASE_PATH + "/");
      return;
    }

    var destination = config.redirects[path];
    var settings = config.settings || {};

    initGoogleAnalytics(settings.googleAnalyticsId);

    if (!destination) {
      if (settings.defaultRedirect) {
        destination = settings.defaultRedirect;
      } else {
        showNotFound(path);
        return;
      }
    }

    trackRedirect(path, destination);
    showRedirecting(destination);

    var delay = settings.redirectDelay || 0;
    setTimeout(function () {
      window.location.replace(destination);
    }, delay);
  }

  function loadConfig(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BASE_PATH + "/redirects.json", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            callback(JSON.parse(xhr.responseText));
          } catch (e) {
            console.error("Failed to parse redirects.json", e);
          }
        } else {
          console.error("Failed to load redirects.json:", xhr.status);
        }
      }
    };
    xhr.send();
  }

  function renderDashboard(config) {
    var settings = config.settings || {};
    initGoogleAnalytics(settings.googleAnalyticsId);

    var tbody = document.getElementById("redirects-body");
    if (!tbody) return;

    var keys = Object.keys(config.redirects);
    if (keys.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">No redirects configured</td></tr>';
      return;
    }

    var origin = window.location.origin + BASE_PATH;
    tbody.innerHTML = keys
      .map(function (key) {
        var fullUrl = origin + "/" + key;
        return (
          "<tr>" +
          '<td><a class="path-link" href="' + fullUrl + '">/' + key + "</a></td>" +
          '<td class="dest-url">' + config.redirects[key] + "</td>" +
          '<td><span class="badge">Active</span></td>' +
          "</tr>"
        );
      })
      .join("");

    var countEl = document.getElementById("redirect-count");
    if (countEl) countEl.textContent = keys.length;

    var baseUrlEls = document.querySelectorAll(".base-url");
    for (var i = 0; i < baseUrlEls.length; i++) {
      baseUrlEls[i].textContent = origin;
    }
  }

  window.RedirectService = {
    loadConfig: loadConfig,
    performRedirect: performRedirect,
    renderDashboard: renderDashboard,
  };
})();
