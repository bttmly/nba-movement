const R = require("ramda");

const MAX = {x: Infinity, y: Infinity};
const sq = x => x * x;
const isBall = R.whereEq({type: "ball"});
const distance = R.curry((a, b) =>
  Math.sqrt(sq(a.x - b.x) + sq(a.y - b.y))
);

// takes a Moment, returns a PlayerCoordinate
function closest (moment) {
  const [[ball], players] = R.partition(isBall, moment.coordinates);
  return R.reduce(distance(ball), MAX, players);
}

module.exports = closest;