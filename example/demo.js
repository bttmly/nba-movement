var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

var through2 = require("through2");

var FILE = path.join(__dirname, "plays.json");
var GAME_ID = "0021401228";

var movement = require("../lib/");

function demo () {
  try {
    fs.unlinkSync(FILE);
  } catch (e) { /* probably worked? */ }

  var st = movement.getMovementForGame(GAME_ID);

  st.on("close", function () {
      console.log("CLOSE");
      console.timeEnd("close");
    })
    .on("end", function () {
      console.log("END");
      console.timeEnd("end");
    });

  st.pipe(logger())
    .pipe(delimitedJson("\n"))
    .pipe(writeOne())
    .pipe(fs.createWriteStream(FILE));
  
  return st;
}

demo();

console.time("end");
console.time("close");
var events = [];

function delimitedJson (d) {
  return through2.obj(function (data, enc, done) {
    done(null, JSON.stringify(data) + d);
  });
}

function toMoment () {
  return through2.obj(function (data, enc, done) {
   done(null, data.moments.map(movement.Moment));
  });
}

function logger () {
  var i = 0;
  return through2.obj(function (data, enc, done) {
    console.log("eventid", data.eventid);
    ++i;
    events.push(data.eventid);
    done(null, data);
  });
}

function writeOne () {
  var written = false;
  return through2(function (data, enc, done) {
    if (!written) {
      written = true;
      var obj = JSON.parse(data.toString().trim());
      var str = JSON.stringify(obj, null, 2);
      fs.writeFileSync(path.join(__dirname, "head.json"), str);
    }
    done(null, data);
  });
}