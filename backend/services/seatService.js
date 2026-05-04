const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

function generateSeatGrid(seatsTotal) {
  const rows = Math.ceil(seatsTotal / COLS.length);
  const seats = [];
  for (let r = 1; r <= rows; r++) {
    for (const c of COLS) {
      if (seats.length < seatsTotal) seats.push(`${r}${c}`);
    }
  }
  return { rows, cols: COLS, seats };
}

module.exports = { generateSeatGrid, COLS };
