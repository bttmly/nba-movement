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
Data from stats.nba.com is presented in a hierarchy of "event", "moment", "coordinate". An "event" is something like a possession (although events seem to overlap a bit on the margins). An entire game has in the neighborhood of 350 to 400 events. A "moment" is an instant in time; the player tracking cameras capture 24 moments per second. So an event will have a few hundred moments. Finally, a "coordiante" is the exact position of a player or ball during a moment. There should be exactly 11 of these (10 players plus the ball) for each moment.

To save space, the raw NBA player movement API packs this data into tuples. Thanks to the work [done here](http://savvastjortjoglou.com/nba-play-by-play-movements.html) we can assign meaningful keys to each data point and create simple data objects.

Documentation on the shapes of each type is coming.

`Moment` shape:
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
