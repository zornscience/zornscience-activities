(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act-question-generator"]');
  var bank, createDeck;
  root.dispatchEvent(new CustomEvent("zsa-generator-bank", {detail: {receive: function (data) { bank = data; }}}));
  root.dispatchEvent(new CustomEvent("zsa-generator-deck", {detail: {receive: function (factory) { createDeck = factory; }}}));
  var deck = createDeck(bank);
  var subject = null, current = null, selected = null, revealed = false;
  var names = {english: 'English', math: 'Math', science: 'Science'};
  function el(id) { return document.getElementById(id); }
  function node(tag, text, className) {
    var result = document.createElement(tag);
    if (text !== undefined) result.textContent = text;
    if (className) result.className = className;
    return result;
  }
  function draw(focus) {
    var result = deck.draw(subject);
    current = result.question; selected = null; revealed = false;
    el('welcome').hidden = true; el('question-view').hidden = false;
    el('subject-label').textContent = names[subject];
    el('progress').textContent = result.seen + ' of ' + result.total + ' seen';
    el('question-title').textContent = names[subject] + ' practice';
    el('question-id').textContent = current.id.toUpperCase();
    el('skill').textContent = current.skill;
    el('context').textContent = current.context || ''; el('context').hidden = !current.context;
    el('prompt').textContent = current.prompt;
    el('table-wrap').replaceChildren(); el('table-wrap').hidden = !current.table;
    if (current.table) {
      var table = node('table'); table.append(node('caption', 'Study results'));
      var head = node('thead'), row = node('tr');
      current.table.headers.forEach(function (h) { var th = node('th', h); th.scope = 'col'; row.append(th); });
      head.append(row); table.append(head);
      var body = node('tbody');
      current.table.rows.forEach(function (values) { var tr = node('tr'); values.forEach(function (v) { tr.append(node('td', String(v))); }); body.append(tr); });
      table.append(body); el('table-wrap').append(table);
    }
    el('choice-list').replaceChildren();
    current.choices.forEach(function (choice, index) {
      var label = node('label', undefined, 'choice');
      var input = document.createElement('input'); input.type = 'radio'; input.name = 'answer'; input.value = index;
      input.addEventListener('change', function () { selected = index; el('check').disabled = false; });
      label.append(input, node('span', 'ABCD'[index] + '.', 'choice-letter'), node('span', choice));
      el('choice-list').append(label);
    });
    el('answer').hidden = true; el('answer').replaceChildren();
    el('check').disabled = true; el('reveal').disabled = false;
    el('reveal').textContent = 'Show answer'; el('reveal').setAttribute('aria-expanded', 'false');
    el('session-status').textContent = result.cycle > 1 && result.seen === 1 ? 'You’ve seen all 200 ' + names[subject] + ' questions. Starting a newly shuffled bank.' : names[subject] + ' selected. Try the question, or show the answer whenever you need it.';
    if (focus) el('question-title').focus();
  }
  function showAnswer(checked) {
    if (!current || revealed || (checked && selected === null)) return;
    revealed = true;
    var title = checked ? (selected === current.answer ? 'Correct: nicely done.' : 'Keep going: here’s how it works.') : 'Here’s the answer';
    var heading = node('h3', title);
    var answer = node('p'); answer.append(node('strong', 'Answer ' + 'ABCD'[current.answer] + ': ' + current.choices[current.answer]));
    el('answer').replaceChildren(heading, answer, node('p', current.explanation)); el('answer').hidden = false;
    el('choice-list').querySelectorAll('label').forEach(function (label, i) {
      label.querySelector('input').disabled = true;
      if (i === current.answer) label.classList.add('correct');
      else if (checked && i === selected) label.classList.add('incorrect');
    });
    el('check').disabled = true; el('reveal').disabled = true;
    el('reveal').textContent = 'Answer shown'; el('reveal').setAttribute('aria-expanded', 'true');
  }
  document.querySelectorAll('[data-subject]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (subject === button.dataset.subject) return;
      subject = button.dataset.subject;
      document.querySelectorAll('[data-subject]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      draw(true);
    });
  });
  el('next').addEventListener('click', function () { if (subject) draw(true); });
  el('reveal').addEventListener('click', function () { showAnswer(false); });
  el('check').addEventListener('click', function () { showAnswer(true); });
})();
