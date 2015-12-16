const {Readable} = require("stream");

const request = require("request");

const BATCH_COUNT = 50;

let BASE_URL = "http://stats.nba.com/stats/locations_getmoments/";

function setBaseUrl (url) {
  BASE_URL = url;
}

function transport (url, query, cb) {
  request({
    url: url,
    qs: query,
    json: true,
    pool: false,
  }, (err, __, body) => cb(err, body));
};

function getMovementForPlay (eventid, gameid, cb) {
  transport(BASE_URL, {eventid, gameid}, function (err, result) {
    if (err) return cb(err);
    if (result == null) return cb();
    if (typeof result !== "object") return cb(new Error("Expected json, found " + result));
    result.eventid = eventid;
    cb(null, result);
  });
}

const DEFAULT_MAX_CONCURRENT = 1;
const DEFAULT_MAX_EMPTY = 10;


function getMovementForGame (gameId, maxConcurrent, maxBlanks) {
  let i = 0;
  let ended = false;
  let blanks = [];

  maxConcurrent = maxConcurrent || DEFAULT_MAX_CONCURRENT;
  maxBlanks     = maxBlanks     || DEFAULT_MAX_EMPTY;

  function updateBlanks () {
    if (n == null) {
      blanks = [];
    } else if (blanks[blanks.length - 1] === n - 1) {
      blanks.push(n);
    } else {
      blanks = [n];
    }
  }

  const readable = new Readable({
    read: function () {
      if (ended) readable.push(null);
    },
    objectMode: true,
  });

  while (i < maxConcurrent) sendRequest(++i);

  return readable;

  function sendRequest (n) {
    if (ended) return;

    // unfortunately there is no way to tell the difference between an eventid
    // that returns null beacuse it's omitted for some mysterious reason
    // (maybe they are time outs?) and an eventid that is past the end of the game
    // we use a consecutive "blanks" counter to guess when we've got to the end 
    // of the game.


    if (blanks.length >= maxBlanks) {
      readable.emit("end");
      ended = true;
      return;
    }

    getMovementForPlay(n, gameId, function (err, data) {

      if (err) {
        err.eventid = n;
        readable.emit("error", err);
      } else if (data) {
        readable.push(data);
      } else {
        updateBlanks(n);
      }

      if (blanks.length)
        console.log("blank count", blanks.length);

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
  setBaseUrl,
  Coordinate,
  Moment,
};
