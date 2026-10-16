// Reads an activity's data.js in Node. The file hands its data to the page through a one-use event on the
// activity root, so a stand-in root catches it.
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadData(file) {
  var data;
  var root = {addEventListener: function (type, fn) { fn({detail: {receive: function (d) { data = d; }}}); }};
  vm.runInNewContext(fs.readFileSync(path.resolve(file), "utf8"), {document: {querySelector: function () { return root; }}});
  if (!data) throw new Error("no data from " + file);
  return JSON.parse(JSON.stringify(data)); // plain objects from this realm, so deepEqual compares values only
}
module.exports = {loadData: loadData};
