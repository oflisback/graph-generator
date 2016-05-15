const exports = module.exports = {};
const math = require('mathjs');

function axisDistance(a, b, axis) {
  if (axis === 'x') {
    return Math.abs(a.xPos - b.xPos);
  }
  return Math.abs(a.yPos - b.yPos);
}
function withinPlaneRange(a, b, limit) {
  return Math.sqrt(Math.pow(a.xPos - b.xPos, 2) +
         Math.pow(a.yPos - b.yPos, 2))
         < limit;
}

function connectNeighbours(nodes, pos, limit, options) {
  let c = (options.forwards) ? Math.min(nodes.length, pos + 1) : Math.max(0, pos - 1);
  const cBreak = (options.forwards) ? nodes.length : -1;
  while (c !== cBreak && axisDistance(nodes[pos], nodes[c], options.axis) < limit) {
    if (withinPlaneRange(nodes[pos], nodes[c], limit)) {
      nodes[pos].vertices[nodes[c].id] = 1;
    }
    c = c + ((options.forwards) ? 1 : -1);
  }
}

// Simple unscientific way to build undirected graphs of arbitrary
// size and with somewhat tunable clustering
exports.generateGraph = function generateGraph(options) {
  const opt = options || {};
  const nbrNodes = opt.nbrNodes || 10;
  const nbrClusterCenters = opt.nbrClusterCenters || 4;
  // Conncetivity affects number of connections between nodes
  const connectivity = opt.connectivity || 0.5;

  // Length of each axis along which we place nodes
  const range = 10 * nbrNodes;
  // Factor affecting cluster width
  const clusterWidth = Math.round(range / nbrClusterCenters);
  const nodesPerAnchor = Math.floor(nbrNodes / nbrClusterCenters);
  const neighbourRange = clusterWidth * connectivity / 2;
  const nbrExtraNodes = nbrNodes - (nodesPerAnchor * nbrClusterCenters);

  const nodes = [];
  for (let i = 0; i < nbrClusterCenters; i++) {
    const anchorX = range * Math.random();
    const anchorY = range * Math.random();
    // Add any extra nodes caused by round off on last anchor.
    const nodesForAnchor = (i !== nbrClusterCenters - 1) ? nodesPerAnchor :
      nodesPerAnchor + nbrExtraNodes;
    for (let j = 0; j < nodesForAnchor; j++) {
      /* rand()*(rand() - 0.5) produces normal distribution centered around 0 */
      const xPos = Math.round(anchorX +
        clusterWidth * (Math.random() * (Math.random() - 0.5)) / 2);
      const yPos = Math.round(anchorY +
        clusterWidth * (Math.random() * (Math.random() - 0.5)) / 2);
      nodes.push({ id: (i * nodesPerAnchor + j), xPos, yPos,
        vertices: Array(nbrNodes).fill(0) });
    }
  }

  // Sort nodes based on xPos before connecting them based on position on
  // x axis.
  nodes.sort((a, b) => a.xPos - b.xPos);

  for (let i = 0; i < nbrNodes; i++) {
    // All nodes should connect to the previous one except the first node
    if (i !== 0) {
      nodes[i].vertices[nodes[i - 1].id] = 1;
    }

    // All nodes should connect to the next one except the last node
    if (i !== nbrNodes - 1) {
      nodes[i].vertices[nodes[i + 1].id] = 1;
    }

    connectNeighbours(nodes, i, neighbourRange, { forwards: false, axis: 'x' });
    connectNeighbours(nodes, i, neighbourRange, { forwards: true, axis: 'x' });
  }

  // At this point all nodes are connected to the graph. Now search for close by node
  // based on y-axis closeness.
  for (let i = 0; i < nbrNodes; i++) {
    connectNeighbours(nodes, i, neighbourRange, { forwards: false, axis: 'y' });
    connectNeighbours(nodes, i, neighbourRange, { forwards: true, axis: 'y' });
  }

  // Sort nodes by id before building adjacency matrix.
  nodes.sort((a, b) => a.id - b.id);

  const adjMatrix = [];
  for (let i = 0; i < nbrNodes; i++) {
    adjMatrix.push(nodes[i].vertices);
  }

  return math.matrix(adjMatrix);
};
