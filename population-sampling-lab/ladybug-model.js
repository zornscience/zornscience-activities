(function () {
  "use strict";
  // Scene coordinates are centimeters from the upper-left inside wall.
  const columns = 6;
  const rows = 4;
  const side = 5;
  const width = columns * side;
  const height = rows * side;
  const cells = Array.from({length: columns * rows}, (_, index) => {
    const row = Math.floor(index / columns), col = index % columns;
    return {index, row, col, x: col * side, y: row * side, label: String.fromCharCode(65 + row) + (col + 1)};
  });

  function cellAt(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    return cells[Math.floor(y / side) * columns + Math.floor(x / side)];
  }

  // Each group uses coordinates relative to its cell. Empty groups are part of the same snapshot.
  const positions = [
    [[.85, 1.3], [4.82, 3.45]],
    [[.16, 1.5], [1.8, 2.7], [2.83, 2.18], [4.0, 4.0]],
    [[1.4, 1.15], [2.6, 1.75], [2.12, 3.0]],
    [],
    [[.75, 1.25], [1.62, 1.82], [2.52, 1.25], [2.6, 2.58], [1.28, 3.2], [3.84, 3.76]],
    [[2.6, 2.9]],
    [[1.6, .91], [2.7, 1.58], [3.76, 2.45], [3.0, 3.46], [1.82, 4.0]],
    [[1.45, 1.85], [2.37, 2.45], [3.26, 1.6], [4.1, 2.8], [2.0, 3.72]],
    [[3.48, 3.2]],
    [[.9, 1.05], [2.05, 1.47], [3.25, .9], [4.15, 2.15], [2.8, 2.9], [1.6, 3.65], [3.72, 4.18]],
    [],
    [[1.4, 1.8], [3.6, 4.26]],
    [[1.4, 1.4], [2.1, 2.5], [3.45, 2.18], [2.9, 3.8]],
    [[2.28, 2.9]],
    [[1.15, 1.15], [2.24, 1.32], [3.61, 1.17], [2.92, 2.46], [1.48, 3.34], [3.9, 4.15]],
    [[1.7, 1.8], [2.7, 2.2], [3.1, 3.42]],
    [[.75, 2], [1.8, 1.4], [2.9, 1.2], [4.16, 2.2], [3.17, 2.84], [1.5, 3.4], [3.84, 4.12]],
    [[2.05, 1.7], [2.85, 4.38]],
    [[1.6, 1.6], [3.4, 3.4]],
    [[1.05, 1.12], [2.2, 1.63], [3.26, 1.25], [3.96, 2.72], [2.61, 2.86], [1.55, 3.67], [3.43, 4.1]],
    [],
    [[1.25, 2.2], [2.5, 1.44], [3.86, 2.3], [2.8, 3.15], [1.35, 4.05]],
    [[1.3, 1.2], [3.05, 1.62], [2.6, 3.28], [3.75, 4.15]],
    [[2.8, 2.05], [3.4, 3.56]]
  ];

  const bugs = cells.flatMap((cell, index) => positions[index].map(([x, y], i) => ({
    id: cell.label + "-" + (i + 1),
    x: cell.x + x,
    y: cell.y + y,
    angle: (index * 79 + i * 133) % 360,
    shade: (index + i) % 3
  })));

  function specimensIn(cell) {
    return bugs.filter(bug => cellAt(bug.x, bug.y) === cell);
  }

  function drawCell(drawn, random = Math.random) {
    const remaining = cells.filter(cell => !drawn.includes(cell));
    return remaining[Math.floor(random() * remaining.length)];
  }

  function measurement(square, vertical) {
    return {vertical, extent: square ? side : vertical ? height : width};
  }

  // Positions follow the three squares in the paper pre-lab, left to right.
  const reef = [
    [["sand", .50, .57], ["star", 1.48, .70], ["star", .92, 1.46]],
    [["star", .69, .46], ["star", 1.50, .44], ["star", .57, 1.38], ["sand", 1.56, 1.40]],
    [["sand", .50, .38], ["sand", 1.48, .37], ["sand", 1.02, 1.00], ["sand", .36, 1.22], ["star", 1.49, 1.55]]
  ];


  const model = {columns, rows, side, width, height, cells, cellAt, bugs, specimensIn, drawCell, measurement, reef};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document === "undefined") return;
  const root = document.querySelector('[data-zsa-activity="population-sampling-lab"]');
  root?.addEventListener("population-sampling-ladybug-model", event => event.detail.receive(model));
}());
