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

function getMovementForGame (gameId, maxConcurrent, maxBlanks) {
  const emitter = new EventEmitter();

  let i = 0;
  let blanks = 0;
  let inFlight = 0;
  let stopped = false;

  maxConcurrent = maxConcurrent || DEFAULT_MAX_CONCURRENT;
  maxBlanks      = maxBlanks    || DEFAULT_MAX_EMPTY;

  while (++i < maxConcurrent) sendRequest(i);

  return emitter;

  function sendRequest (n) {
    if (stopped) return;

    // unfortunately there is no way to tell the difference between an eventid
    // that returns null beacuse it's omitted for some mysterious reason
    // (maybe they are timeouts?) and an eventid that is past the end of the game
    // we use a consecutive "blanks" counter to guess when we've got to the end 
    // of the game.

    // close indicates no more data will be emitted
    if (blanks >= maxBlanks) {
      stopped = true;
      emitter.emit("close");
    }

    inFlight += 1;
    getMovementForPlay(n, gameId, (err, data) => {
      inFlight -= 1;

      if (stopped) {
        // end indicates all requests have finished
        if (inFlight === 0) {
          emitter.emit("end");
        }
        return;
      }

      if (err) return emitter.emit("error", err);

      // unclear what we should do with eventids that return null (no error either)
      // here we elect to just skip them so the output stream is not sparse
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

// These "constructors" are to help destructuring movement data in to meaningful
// semantic fields. The NBA's format is extremely concise but is a pain in the neck
// without a way to assign meaning to fields.
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
