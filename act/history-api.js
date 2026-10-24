// ACT Practice history: the only file that talks to a server. act.js asks for a new practice code and PIN, a code's
// history (with its PIN), saving one finished section (with the PIN), or a teacher's class set of codes and PINs by
// dispatching "zsa:history" on the root with {action, api, code, body, done}. Every request is a POST, so a PIN is only ever in a request body, never in an address.
// This file calls the ZornScience ACT Practice History plugin on zornscience.org (see wordpress/ in the repository)
// and calls done(error, result). Requests send no cookies, and nothing is stored in the browser.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var PATHS = {
    "new": function () { return "/codes"; },
    open: function (code) { return "/codes/" + encodeURIComponent(code) + "/open"; },
    save: function (code) { return "/codes/" + encodeURIComponent(code) + "/attempts"; },
    "class": function () { return "/class-lists"; }
  };
  root.addEventListener("zsa:history", function (event) {
    var d = event.detail;
    if (!PATHS[d.action] || !/^https:\/\/zornscience\.org\//.test(d.api)) { d.done({status: 0}); return; }
    var url = d.api.replace(/\/+$/, "") + PATHS[d.action](d.code);
    var controller = typeof AbortController === "undefined" ? null : new AbortController();
    var timeout = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;
    var init = {method: "POST", mode: "cors", credentials: "omit", cache: "no-store", headers: {Accept: "application/json"}};
    if (d.body) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(d.body);
    }
    if (controller) init.signal = controller.signal;
    fetch(url, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (timeout) clearTimeout(timeout);
        if (res.ok) d.done(null, json);
        else d.done({status: res.status, code: json && json.code, max: json && json.data && json.data.max});
      });
    }, function () {
      if (timeout) clearTimeout(timeout);
      d.done({status: 0});
    });
  });
}());
