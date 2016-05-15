## What is this?

A simple immature tool for generating undirected graphs of arbitrary size with somewhat tunable clustering properties.

## Usage

The main entry point is the generateGraph function. It takes an optional options parameter and returns an [adjacency matrix](https://en.wikipedia.org/wiki/Adjacency_matrix) graph representation.

Here's an example options object with default values:

```js
const options = {
  nbrNodes: 100,
  nbrClusterCenters: 4,
  // Connectivity affects number of connections between nodes
  connectivity: 0.5
}
```

## Example

To generate the graphs nodes are placed randomly in two dimensions. In the graphs below node density is illustrated with two different numbers of cluster centers. Top graph uses 5 cluster centers, bottom one 50. Nodes are placed randomly around cluster centers based on a normal distribution.

![50000 nodes, 5 cluster centers](https://cloud.githubusercontent.com/assets/12221141/15276687/bee8fec6-1aef-11e6-9f5f-e755912de014.png "50000 nodes, 5 cluster centers")

![50000 nodes, 50 cluster centers](https://cloud.githubusercontent.com/assets/12221141/15276689/c1d2eb10-1aef-11e6-976a-e70e01bef491.png "50000 nodes, 50 cluster centers")

## Tests

Some basic tests are included:

```sh
npm run test
```
## Dependencies

The implementation relies on http://mathjs.org/ for matrix implementation.

## License

MIT
