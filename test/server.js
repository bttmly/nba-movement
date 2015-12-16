var fs = require("fs");

// server that emmulates latency between client and nba stats server

function randomTime (t) {
  return Math.random() * (t || 1) * 1000;
}

const app = require("express")();

const MOMENT = [0, 0, 0, 0, null, [[0, 0, 0, 0, 0]]];

const PLAYER = {
  lastname: "",
  firstname: "",
  playerid: 0,
  jersey: 0,
  position: "",
};

const TEAM = {
  name: "",
  teamid: 0,
  abbreviation: "",
  players: [PLAYER],
};


const RESPONSE = {
  gameid: "00",
  gamedate: "0000-00-00",
  visitor: TEAM,
  home: TEAM,
  moments: [MOMENT],
  eventid: 0,
};

function sendResponse (res, eventid) {
  res.json({eventid, ...RESPONSE});
}

// every request gets a good response
app.use("/unicorns-and-rainbows", function (req, res) {
  var eventid = Number(req.query.eventid);
  setTimeout(function () {
    sendResponse(res, eventid);
  }, randomTime());
});

// some requests get null responses, rest have data
app.use("/just-rainbows", function (req, res) {

});

// some requests get null responses, some get errors, rest have data
app.use("/reality", function (req, res) {
  var eventid = Number(req.query.eventid);
  
  if (eventid % 100 === 0) {
    return setTimeout(function () {
      res.status(500).json({message: "Error"});
    });
  }

  setTimeout(function () {
    sendResponse(res, eventid);
  }, randomTime());
});

// app.listen()