const {EventEmitter} = require("events");

const request = require("request");

const BATCH_COUNT = 50;
const GAME_URL = "http://stats.nba.com/stats/locations_getmoments/";

function transport (url, query, cb) {
  request({
    url: url,
    qs: query,
    json: true,
    pool: false,
  }, (err, __, body) => cb(err, body));
};

function getMovementForPlay (eventid, gameid, cb) {
  transport(GAME_URL, {eventid, gameid}, cb);
}

const DEFAULT_MAX_CONCURRENT = 50;
const DEFAULT_MAX_EMPTY = 10;

function getMovementForGame (gameId, maxConcurrent, maxEmpty) {
  const emitter = new EventEmitter();

  let i = 0;
  let blanks = 0;
  let ended = false;

  maxConcurrent = maxConcurrent || DEFAULT_MAX_CONCURRENT;
  maxEmpty      = maxEmpty      || DEFAULT_MAX_EMPTY;

  while (++i < maxConcurrent) sendRequest(i);

  return emitter;

  function sendRequest (n) {
    if (ended) return;

    // multiple requests will still be in flight after "end" is called
    if (blanks > maxEmpty) {
      ended = true;
      return emitter.emit("end");
    }

    getMovementForPlay(n, gameId, (err, data) => {
      if (ended) return;

      if (err) return emitter.emit("error", err);

      if (data) {
        data.eventid = n;
        blanks = 0;
        emitter.emit("data", data);
      } else {
        blanks += 1;
      }

      sendRequest(++i);
    });
  }
}

let Moment = data => ({
  quarter: data[0],
  timestamp: data[1],
  gameClock: data[2],
  shotClock: data[3],
  // [4] is always(?) null
  coordinates: data[5].map(Coordinate),
});

let Ball = tuple => ({
  type: "ball",
  // [0] is -1 for ball
  // [1] is -1 for ball
  x: tuple[2],
  y: tuple[3],
  radius: tuple[4],
});

let Player = tuple => ({
  type: "player",
  teamId: tuple[0],
  playerId: tuple[1],
  x: tuple[2],
  y: tuple[3],
  // [4] is 0 for player
});

let isBall = tuple => tuple[0] === -1;

let Coordinate = tuple => isBall(tuple) ? Ball(tuple) : Player(tuple);

module.exports = {
  getMovementForPlay,
  getMovementForGame,
  Coordinate,
  Moment,
};
