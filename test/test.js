const movement = require("../src");

const T = require("through2");


function isMonotonicallyIncreasing () {
  let last;

  return T.obj(function (value, enc, next) {
    if (typeof value !== "number") {
      return next(new Error(`Value must be a number, found ${value}`));
    }

    if (last == null) {
      last = value;
      return next();
    }

    if (value <= last) {
      next(new Error(`${value} was not greater than ${last}`));
    }

    next(null, value);
  });
}

function streamCollect (arr) {
  return T.obj(function (value, enc, next) {
    arr.push(value);
    next(null, value);
  });
}

// stats.nba.com/stats/locations_getmoments/?eventid=1&gameid=0021401228

const ORIGINAL = "http://stats.nba.com/stats/locations_getmoments/";

const GAME_ID = "0021401228";

describe("movement", function () {

  describe("#getMovementForPlay", function () {

    it("works", function (done) {
      movement.getMovementForPlay(1, GAME_ID, function (err, result) {
        console.log(result);
        done();
      });
    });
  });

  xdescribe("#getMovementForGame", function () {

    describe("Unicorns and Rainbows (no errors)", function () {
      before(function () {
        // movement.setBaseUrl("http://localhost:5432/unicorns-and-rainbows");
      });

      after(function () {
        // movement.setBaseUrl(ORIGINAL);
      });

      it("streams out ordered results", function () {

      });
    });

  });

});
