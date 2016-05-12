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

function connectNeighbours(nodes, i, forwards, range, axis) {
  let c = (forwards) ? Math.min(nodes.length, i + 1) : Math.max(0, i - 1);
  const cBreak = (forwards) ? nodes.length : 0;
  while (c !== cBreak && axisDistance(nodes[i], nodes[c], axis) < range) {
    if (withinPlaneRange(nodes[i], nodes[c], range)) {
      nodes[i].vertices[nodes[c].id] = 1;
    }
    c = c + ((forwards) ? 1 : -1);
  }
}

exports.generateGraph = function generateGraph(options) {
  const opt = options || {};
  const nbrNodes = opt.nbrNodes || 10;
  const distanceFactor = opt.distanceFactor || 1;
  const spacing = 100;
  const neighbourRange = spacing * distanceFactor;
  const nodes = [];
  const adjMatrix = [];

  // Randomly place all nodes within a large range
  for (let i = 0; i < nbrNodes; i++) {
    // Nodes with identical position is ok
    const xPos = Math.floor(Math.random() * (spacing * nbrNodes + 1));
    const yPos = Math.floor(Math.random() * (spacing * nbrNodes + 1));
    nodes.push({ id: i, xPos, yPos, vertices: Array(nbrNodes).fill(0) });
  }

  // Sort nodes based on xPos
  nodes.sort((a, b) => a.xPos - b.xPos);

  for (let i = 0; i < nbrNodes; i++) {
    connectNeighbours(nodes, i, false, neighbourRange, 'x');

    // All nodes should connect to the previous one except the first node
    if (i !== 0) {
      nodes[i].vertices[nodes[i - 1].id] = 1;
    }

    // All nodes should connect to the next one except the last node
    if (i !== nbrNodes - 1) {
      nodes[i].vertices[nodes[i + 1].id] = 1;
    }

    connectNeighbours(nodes, i, true, neighbourRange, 'x');
  }

  // At this point all nodes are connected to the graph. Now search for close by node
  // based on y-axis closeness.
  for (let i = 0; i < nbrNodes; i++) {
    connectNeighbours(nodes, i, false, neighbourRange, 'y');

    connectNeighbours(nodes, i, true, neighbourRange, 'y');
  }

  // Sort nodes by id
  nodes.sort((a, b) => a.id - b.id);
  for (let i = 0; i < nbrNodes; i++) {
    adjMatrix.push(nodes[i].vertices);
  }

  return math.matrix(adjMatrix);
};