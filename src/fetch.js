const {Readable} = require("stream");
const request = require("request");

const defaults = { maxBlanks: 10 };

let baseUrl = "http://stats.nba.com/stats/locations_getmoments/";

function setBaseUrl (url) {
  baseUrl = url;
}

function getMovementForPlay (eventid, gameid, cb) {
  request({
    url: baseUrl,
    qs: {eventid, gameid},
    json: true,
    pool: false,
  }, function (err, __, body) {
    if (err) return cb(err);
    if (result == null) return cb();
    if (typeof result !== "object") return cb(new Error("Expected json, found " + result));
    result.eventid = eventid;
    cb(null, result);
  });
}

// It's impossible to tell solely from an event whether it marks the end of a game, 
// since while game clock information is present, scores aren't, so using the game 
// clock only would ignore overtime games. Ideally, we'd just keep incrementing eventid
// until we ran out of events, then say we've got every event for a given game.
// Unfortunately, some eventids return null. Occasionally these come up a couple times
// in a row. So, to determine when we've reached the end of a game, we allow a `maxBlanks`
// parameter, which determines we've reached the end of a game's events when that many
// consecutive blank responses come back

function getMovementForGame (gameId, options = {}) {
  let i = 0;
  let ended = false;
  let blanks = [];
  
  const maxBlanks = options.maxBlanks || defaults.maxBlanks;

  function updateBlanks (n) {
    if (n == null) {
      blanks = [];
    } else if (blanks[blanks.length - 1] === n - 1) {
      blanks.push(n);
    } else {
      blanks = [n];
    }
  }

  const readable = new Readable({
    objectMode: true,
    read: function () {
      console.log("ending...");
      if (ended) readable.push(null);
    },
  });

  return readable;

  function sendRequest (n) {
    if (ended) return;

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
        updateBlanks();
      } else {
        updateBlanks(n);
      }

      sendRequest(++i);
    });
  }
}

module.exports = {
  getMovementForPlay,
  getMovementForGame,
  setBaseUrl,
}