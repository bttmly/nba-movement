require("leaked-handles");

var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

var through2 = require("through2");
var h = require("highland");

var FILE = path.join(__dirname, "plays.json");
var GAME_ID = "0021401228";

var movement = require("../src");

function demo () {
  try {
    fs.unlinkSync(FILE)
    fs.writeFileSync(FILE, "");
  } catch (e) { /* probably worked? */ }

  var ee = movement.getMovementForGame(GAME_ID);
  
  var st = h("data", ee)
    .pipe(momentize())
    .pipe(delimitedJson("\n"))
    .pipe(writeOne())
    .pipe(logger())
    .pipe(fs.createWriteStream(FILE));

  ee.on("end", function () { st.destroy() });

  return ee;
}

console.time("demo");
demo().on("end", function () {
  console.timeEnd("demo");
});























function delimitedJson (d) {
  return through2.obj(function (data, enc, done) {
    done(null, JSON.stringify(data) + d);
  });
}

function momentize () {
  return through2.obj(function (data, enc, done) {
   done(null, data.moments.map(movement.Moment));
  });
}

function logger () {
  var i = 0;
  return through2(function (data, enc, done) {
    console.log("writing item", ++i);
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
  })
}