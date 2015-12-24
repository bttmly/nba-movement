const R = require("ramda");

const MAX = {x: Infinity, y: Infinity};
const sq = x => x * x;
const isBall = R.whereEq({type: "ball"});
const distance = R.curry((o, p) =>
  Math.sqrt(sq(o.x - p.x) + sq(o.y - p.y))
);

function closest (moment) {
  const [[ball], players] = R.partition(isBall, moment.coordinates);
  return R.reduce(distance(ball), MAX, players);
}

module.exports = closest;