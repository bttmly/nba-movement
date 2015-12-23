const R = require("ramda");

const MAX = {x: Infinity, y: Infinity};
const sq = x => x * x;
const dist = ([_x, _y]) => ({x, y}) => Math.sqrt(sq(_x - x) + sq(_y - y));
const minFromBall = ball => R.minBy(dist([ball.x, ball.y]));
const isBall = R.whereEq({type: "ball"});

function closest (moment) {
  const [[ball], players] = R.partition(isBall, moment.coordinates);
  return R.reduce(minFromBall(ball), MAX, players);
}

module.exports = closest;