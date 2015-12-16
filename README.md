# nba-movement (WIP)

*This project is under active development. The API will not change but certain observable behaviors likely will. Use at your own risk!*

A Node wrapper for easy access to the NBA's player movement API. see `example/demo.js` for code, or clone this project and run `make demo`.

Best used with [nba](https://github.com/nickb1080/nba)

### usage

```
npm install nba-movement
```

### API

#### `getMovementForPlay(Number eventId, String gameId, Function callback) -  > void`

#### `getMovementForGame(String gameId) -> ReadableStream`

#### `Moment(Array tuple) -> MomentStruct`
See below

#### `Coordinate(Array tuple) -> CoordinateStruct`
See below

#### Data
A raw "coordiante" (the position on the floor of the ball or a player looks like this):
```
[1610612761, 200768, 72.8909, 23.36539, 0] // player
[-1, -1, 48.38345, 28.75741, 4.8347] // ball
```

A raw "moment" (a bit of metadata, plus the moments of the ball and of all players), 
[1, 1429139443003, 720, 24, null, []Moment]

`nba-movement` provides `Moment` and `Coordinate` "constructors" that provide semantic keys for these two tuple types. The NBA's raw data format is good in terms of space requirements but is a pain in the ass to use directly.

`MomentStruct` shape:
```
{
  quarter: Number,
  timestamp: Number,
  gameClock: Number,
  shotClock: Number,
  coorinates: []Coordinate
}
```

`Coordinate` comes in two flavors:
```
// ball
{
  type: "ball"
  x: Number,
  y: Number,
  radius: Number
}

// player
{
  type: "player"
  playerId: Number,
  teamId: Number,
  x: Number,
  y: Number
}

```
