(function () {
  "use strict";
  function language(search) { return new URLSearchParams(search).get("lang") === "es" ? "es" : "en"; }
  function link(href, base, lang) {
    var url = new URL(href, base), current = new URL(base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return href;
    if (url.origin !== current.origin && url.hostname !== "activities.zornscience.org") return href;
    if (lang === "es") url.searchParams.set("lang", "es");
    else url.searchParams.delete("lang");
    return url.href;
  }
  function fill(text, values) {
    return text.replace(/\{(\w+)\}/g, function (match, key) { return values[key] === undefined ? match : values[key]; });
  }
  var api = {language:language, link:link, fill:fill};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  var root = document.querySelector("[data-zsa-activity]");
  if (!root) return;
  var lang = language(location.search), strings = {};
  api.lang = lang;
  api.text = function (text, values) { return fill(lang === "es" && Object.hasOwn(strings, text) ? strings[text] : text, values || {}); };
  api.localize = function localize(value) {
    if (typeof value === "string") return api.text(value);
    if (Array.isArray(value)) return value.map(localize);
    if (value && typeof value === "object") {
      var result = {};
      Object.keys(value).forEach(function (key) { result[key] = localize(value[key]); });
      return result;
    }
    return value;
  };
  api.url = function (href) { return link(href, location.href, lang); };
  api.configure = function (copy) {
    strings = copy.es || {};
    document.documentElement.lang = lang === "es" ? "es-MX" : "en";
    document.title = api.text(copy.title) + " | ZornScience";
    // Only the initial static markup is translated here. Dynamic views use text() or localized data.
    function visit(el) {
      if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) return;
      Array.from(el.childNodes).forEach(function (child) {
        if (child.nodeType === 3 && child.textContent.trim()) {
          var text = child.textContent, trimmed = text.trim();
          child.textContent = text.replace(trimmed, api.text(trimmed));
        } else if (child.nodeType === 1) visit(child);
      });
      ["aria-label", "placeholder", "title", "alt"].forEach(function (attr) {
        if (el.hasAttribute(attr)) el.setAttribute(attr, api.text(el.getAttribute(attr)));
      });
    }
    visit(root);
    var host = root.querySelector("[data-zsa-header-tools]") || root.querySelector("header");
    if (host) {
      var nav = document.createElement("nav");
      nav.className = "zsa-languages"; nav.setAttribute("data-zsa-chrome", "");
      nav.hidden = root.classList.contains("zsa--embedded"); nav.setAttribute("aria-label", "Idioma / Language");
      ["en", "es"].forEach(function (code) {
        var a = document.createElement("a"); a.className = "zsa-btn";
        a.textContent = code.toUpperCase(); a.lang = code === "es" ? "es-MX" : "en";
        a.href = link(location.href, location.href, code);
        if (root.classList.contains("zsa--embedded")) a.target = "_top";
        a.setAttribute("aria-label", code === "es" ? "ES Español" : "EN English");
        if (code === lang) a.setAttribute("aria-current", "true");
        a.addEventListener("click", function (event) {
          a.href = link(location.href, location.href, code);
          if (!api.onChange || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); lang = code; api.lang = code;
          history.replaceState(null, "", link(location.href, location.href, code));
          document.documentElement.lang = code === "es" ? "es-MX" : "en";
          document.title = api.text(copy.title) + " | ZornScience";
          Array.from(nav.children).forEach(function (toggle) {
            if (toggle.lang === (code === "es" ? "es-MX" : "en")) toggle.setAttribute("aria-current", "true");
            else toggle.removeAttribute("aria-current");
          });
          api.onChange(code);
        });
        nav.appendChild(a);
      });
      host.appendChild(nav);
    }
    root.querySelectorAll("a[href]").forEach(function (a) {
      if (!a.closest(".zsa-languages") && !a.getAttribute("href").startsWith("#")) a.href = api.url(a.href);
    });
  };
  root.addEventListener("zsa:request-i18n", function (event) { event.detail.receive(api); });
}());
