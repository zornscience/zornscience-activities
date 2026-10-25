// Separate shuffled queues: every question appears once before its subject restarts.
(function () {
  "use strict";
  function createDeck(bank, random) {
    random = random || Math.random;
    var states = {};
    Object.keys(bank).forEach(function (key) { states[key] = {queue: [], count: 0, cycle: 0, last: null}; });
    return {draw: function (subject) {
      if (!Object.prototype.hasOwnProperty.call(states, subject)) throw new Error('Unknown subject');
      var state = states[subject];
      var questions = bank[subject];
      if (!questions.length) throw new Error('Empty question bank');
      if (!state.queue.length) {
        state.queue = questions.slice();
        for (var i = state.queue.length - 1; i > 0; i--) {
          var j = Math.floor(random() * (i + 1));
          var temp = state.queue[i]; state.queue[i] = state.queue[j]; state.queue[j] = temp;
        }
        // Avoid an immediate repeat at the boundary between complete passes.
        var end = state.queue.length - 1;
        if (end > 0 && state.queue[end].id === state.last) {
          var first = state.queue[0]; state.queue[0] = state.queue[end]; state.queue[end] = first;
        }
        state.count = 0; state.cycle++;
      }
      var question = state.queue.pop();
      state.count++; state.last = question.id;
      return {question: question, seen: state.count, total: questions.length, cycle: state.cycle};
    }};
  }
  if (typeof module === 'object' && module.exports) module.exports = createDeck;
  else {
    var root = document.querySelector('[data-zsa-activity="act-question-generator"]');
    if (root) root.addEventListener("zsa-generator-deck", function (event) { event.detail.receive(createDeck); });
  }
})();
