# nba-movement (WIP)

*This project is under active development. The API will not change but certain observable behaviors likely will. Use at your own risk!*

A Node wrapper for easy access to the NBA's player movement API. see `example/demo.js` for code, or clone this project and run `make demo`.

Best used with [nba](https://github.com/nickb1080/nba)

### usage

```
npm install nba-movement
```

### API

##### `getMovementForPlay(Number eventId, String gameId, Function callback) -  > void`

##### `getMovementForGame(String gameId) -> ReadableStream`

##### `Moment(Array tuple) -> MomentStruct`
See below

##### `Coordinate(Array tuple) -> CoordinateStruct`
See below

##### `Event(Object data) -> EventStruct`
See below

### Utils

This repo will also house a set of utility functions for working with player movement data. In fact I hope these contain most of the code in the repo, since the core data fetching feature is extremely minimal. Contributions or ideas for helpful utilities are very welcome. For consistency, I would impose only one loose constraint: that utilities should ideally take a data structure below as a parameter and also return one of these data structures. For instance, the `closest` util takes a `Moment` and returns a `PlayerCoordinate`. Obviously this doesn't fit for all cases; a `possession` util might take a `Moment` or `Event` and return a `Number` representing the possessing team's id.

### Data
Data from stats.nba.com is presented in a hierarchy of "event", "moment", "coordinate". An "event" is something like a possession (although events seem to overlap a bit on the margins). An entire game has in the neighborhood of 350 to 400 events. A "moment" is an instant in time; the player tracking cameras capture 24 moments per second. So an event will have a few hundred moments. Finally, a "coordiante" is the exact position of a player or ball during a moment. There should be exactly 11 of these (10 players plus the ball) for each moment.

To save space, the raw NBA player movement API packs this data into tuples. Thanks to the work [done here](http://savvastjortjoglou.com/nba-play-by-play-movements.html) we can assign meaningful keys to each data point and create simple data objects.

Core types: (these types have exposed constructors, as noted above)
`Coordinate`
`Moment`
`Event`

Component types: (these are internal, no need to construct directly)
`TeamInfo`
`PlayerInfo`

#### Coordinate

`Coordinate` comes in two flavors:
```
// BallCoordinate
{
  type: "ball"
  x: Number,
  y: Number,
  radius: Number
}

// PlayerCoordinate
{
  type: "player"
  playerId: Number,
  teamId: Number,
  x: Number,
  y: Number
}
```

A little trick for pulling apart the coordinate list with ES6 destructuring and Lodash or Ramda:

```js
// with Lodash
const [[ball], players] = _.partition(coordinates, {type: "ball"});
// or Ramda
const [[ball], players] = R.partition(R.whereEq({type: "ball"}), coordinates);
````

#### Moment
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

#### Event
`Event` shape:
```
{
  gameId: String,
  gameDate: String,
  visitor: TeamInfo,
  home: TeamInfo,
  moments: []Moment
}
```

#### TeamInfo
`TeamInfo` shape:
```
{
  name: String,
  teamId: Number,
  abbreviation: String,
  players: []PlayerInfo
}
```

#### PlayerInfo
`PlayerInfo` shape:
```
{
  lastName: String,
  firstName: String,
  playerId: Number,
  jersey: String,
  position: String
}
```
