(function () {
  "use strict";

  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  root.addEventListener("zsa:molar-mass-notebook", (event) => event.detail(createNotebookTools), {once: true});

  function createNotebookTools({model, t, element, setText, getState, replaceNotebook, renderPrediction}) {
    const $ = (id) => document.getElementById(id);
    const notebook = () => getState().notebook;
    const debrief = () => notebook().debrief;
    const predictions = () => notebook().predictions;
    const liquidLabel = (code) => code + " " + t(model.liquids[code]);
    const layersLabel = (count) => t(count === 1 ? "One layer" : "Two layers");
    const pairCodes = Object.fromEntries(Object.entries(model.mixing.recipesMl).map(([number, recipe]) => [number, Object.keys(recipe)]));
    const predictionFields = {spread: $("predict-spread"), slowest: $("predict-slowest")};
    const pairFields = {};
    const stationFields = [$("debrief-test-1"), $("debrief-test-2")];
    const responses = [
      ["debrief-revisit", debrief, "revisit"],
      ["debrief-evidence-1", () => debrief().evidence[0], "notes"],
      ["debrief-evidence-2", () => debrief().evidence[1], "notes"],
      ["debrief-explanation", debrief, "explanation"]
    ];
    const stations = {
      wax: ["Test 1", "Wax paper"], shot: ["Test 2", "Steel shot"], mixing: ["Test 3", "Mixing rack"]
    };
    const feedback = {
      prediction: "Describe one prediction and how it compared with what you observed.",
      cite: "Choose two different tests and cite an observation from each one.",
      record: "Record an observation in each test you cite.",
      explanation: "Explain how both observations about water can be true.",
      complete: "You cited two different tests and responded to the question about water. Check that your observations support your explanation."
    };
    const dialog = $("open-notebook");
    const fileInput = $("notebook-file");
    const fileOpen = $("open-notebook-confirm");
    let checked = false;
    let fileMessage = "", openMessage = "", openAttempt = 0;
    // The notebook as last saved to or opened from a file. A blank notebook needs no warning.
    const blankRevision = model.notebookRevision(notebook());
    let savedRevision = blankRevision;

    // Local date and time tell saved files apart on a shared laptop without putting a name in the file.
    function notebookFileName(date) {
      const two = (value) => String(value).padStart(2, "0");
      const day = `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
      return `molar-mass-trap-notebook-${day}-${two(date.getHours())}${two(date.getMinutes())}${two(date.getSeconds())}.json`;
    }

    function hasUnsavedEntries() {
      const revision = model.notebookRevision(notebook());
      return revision !== blankRevision && revision !== savedRevision;
    }

    function setOptions(select, options, value) {
      select.replaceChildren(...options.map(([key, label]) => {
        const option = element("option", "", label);
        option.value = key;
        return option;
      }));
      select.value = value;
    }

    function stationLabel(key) {
      return key ? stations[key].map((label) => t(label)).join(" · ") : "";
    }

    function renderPrintedPredictions() {
      const {spread, slowest, mixing} = predictions();
      const lines = [];
      if (spread) lines.push(t("Farthest spread on wax paper") + " · " + liquidLabel(spread));
      if (slowest) lines.push(t("Slowest shot fall") + " · " + liquidLabel(slowest));
      const pairs = Object.entries(mixing).filter(([, count]) => count !== null).map(([number, count]) =>
        t("Tube {number}", {number}) + " · " + pairCodes[number].map(liquidLabel).join(" + ") + " · " + layersLabel(count));
      $("print-predictions").hidden = lines.length + pairs.length === 0;
      $("print-prediction-entries").replaceChildren(...lines.concat(pairs).map((line) => element("li", "", line)));
    }

    function renderDebrief() {
      const answers = responses.map(([id, read, key]) => {
        const value = read()[key];
        setText($(id + "-print"), value);
        return value;
      });
      for (const [index, field] of stationFields.entries()) {
        setText($(field.id + "-print"), stationLabel(debrief().evidence[index].station));
      }
      $("debrief").dataset.hasResponses = String(answers.some((answer) => answer.trim()));
      setText($("debrief-status"), checked ? t(feedback[model.debriefStatus(notebook())]) : "");
    }

    function render() {
      const choose = ["", t("Choose")];
      const liquids = [choose, ...Object.keys(model.liquids).map((code) => [code, liquidLabel(code)])];
      for (const [key, field] of Object.entries(predictionFields)) setOptions(field, liquids, predictions()[key]);
      for (const [number, field] of Object.entries(pairFields)) {
        setText(field.label, t("Tube {number}", {number}) + " · " + pairCodes[number].join(" + "));
        setOptions(field.select, [choose, [1, layersLabel(1)], [2, layersLabel(2)]], predictions().mixing[number] ?? "");
      }
      const tests = [choose, ...Object.keys(stations).map((key) => [key, stationLabel(key)])];
      for (const [index, field] of stationFields.entries()) setOptions(field, tests, debrief().evidence[index].station);
      for (const [id, read, key] of responses) $(id).value = read()[key];
      renderPrintedPredictions();
      renderDebrief();
      renderFileMessages();
    }

    function renderFileMessages() {
      setText($("notebook-file-status"), fileMessage ? t(fileMessage) : "");
      setText($("open-notebook-status"), openMessage ? t(openMessage) : "");
    }

    function responseChanged() {
      checked = false;
      renderDebrief();
    }

    for (const [key, field] of Object.entries(predictionFields)) field.addEventListener("change", () => {
      predictions()[key] = field.value;
      renderPrintedPredictions();
    });
    for (const number of Object.keys(pairCodes)) {
      const row = element("div", "zsa-mmt-prediction-row");
      const label = element("label");
      const select = element("select");
      select.id = "predict-mix-" + number;
      label.htmlFor = select.id;
      row.append(label, select);
      $("predict-pairs").append(row);
      pairFields[number] = {label, select};
      select.addEventListener("change", () => {
        predictions().mixing[number] = select.value ? Number(select.value) : null;
        renderPrediction(number);
        renderPrintedPredictions();
      });
    }
    for (const [index, field] of stationFields.entries()) field.addEventListener("change", () => {
      debrief().evidence[index].station = field.value;
      responseChanged();
    });
    for (const [id, read, key] of responses) $(id).addEventListener("input", () => {
      read()[key] = $(id).value;
      responseChanged();
    });
    $("check-debrief").addEventListener("click", () => {
      checked = true;
      renderDebrief();
    });

    $("save-notebook").addEventListener("click", () => {
      let url;
      try {
        const file = new Blob([model.encodeNotebook(notebook())], {type: "application/json"});
        url = URL.createObjectURL(file);
        const link = element("a");
        link.href = url;
        link.download = notebookFileName(new Date());
        link.click();
        savedRevision = model.notebookRevision(notebook());
        fileMessage = "Notebook file ready to save.";
      } catch {
        fileMessage = "The notebook file could not be prepared. Your entries are still in the notebook.";
      } finally {
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      renderFileMessages();
    });
    $("open-notebook-open").addEventListener("click", () => dialog.showModal());
    dialog.addEventListener("close", () => {
      fileInput.value = "";
      openMessage = "";
      fileOpen.disabled = true;
      openAttempt++;
      renderFileMessages();
    });
    fileInput.addEventListener("change", () => {
      openMessage = "";
      openAttempt++;
      fileOpen.disabled = fileInput.files.length === 0;
      renderFileMessages();
    });
    fileOpen.addEventListener("click", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const attempt = ++openAttempt;
      fileOpen.disabled = true;
      let imported;
      try {
        imported = model.decodeNotebook(await file.text());
      } catch {
        imported = null;
      }
      if (attempt !== openAttempt || !dialog.open) return;
      if (!imported) {
        openMessage = "Choose a notebook file saved by this lab.";
        fileOpen.disabled = false;
        renderFileMessages();
        return;
      }
      checked = false;
      fileMessage = "Notebook entries reopened.";
      replaceNotebook(imported);
      savedRevision = model.notebookRevision(notebook());
      dialog.close();
    });

    // Reloading or closing the page clears the notebook, so ask first when entries have not been saved to a file.
    window.addEventListener("beforeunload", (event) => {
      if (!hasUnsavedEntries()) return;
      event.preventDefault();
      event.returnValue = "";
    });

    return {render, reset() {
      checked = false;
      savedRevision = blankRevision;
      fileMessage = "";
      $("predictions").open = false;
      $("reasoning-notes").open = false;
    }};
  }
}());
