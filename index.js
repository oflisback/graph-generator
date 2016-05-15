'use strict';

var _exports = module.exports = {};
var math = require('mathjs');

function axisDistance(a, b, axis) {
  if (axis === 'x') {
    return Math.abs(a.xPos - b.xPos);
  }
  return Math.abs(a.yPos - b.yPos);
}
function withinPlaneRange(a, b, limit) {
  return Math.sqrt(Math.pow(a.xPos - b.xPos, 2) + Math.pow(a.yPos - b.yPos, 2)) < limit;
}

function connectNeighbours(nodes, pos, limit, options) {
  var c = options.forwards ? Math.min(nodes.length, pos + 1) : Math.max(0, pos - 1);
  var cBreak = options.forwards ? nodes.length : -1;
  while (c !== cBreak && axisDistance(nodes[pos], nodes[c], options.axis) < limit) {
    if (withinPlaneRange(nodes[pos], nodes[c], limit)) {
      nodes[pos].vertices[nodes[c].id] = 1;
    }
    c = c + (options.forwards ? 1 : -1);
  }
}

// Simple unscientific way to build undirected graphs of arbitrary
// size and with somewhat tunable clustering
_exports.generateGraph = function generateGraph(options) {
  var opt = options || {};
  var nbrNodes = opt.nbrNodes || 10;
  var nbrClusterCenters = opt.nbrClusterCenters || 4;
  // Conncetivity affects number of connections between nodes
  var connectivity = opt.connectivity || 0.5;

  // Length of each axis along which we place nodes
  var range = 10 * nbrNodes;
  // Factor affecting cluster width
  var clusterWidth = Math.round(range / nbrClusterCenters);
  var nodesPerAnchor = Math.floor(nbrNodes / nbrClusterCenters);
  var neighbourRange = clusterWidth * connectivity / 2;
  var nbrExtraNodes = nbrNodes - nodesPerAnchor * nbrClusterCenters;

  var nodes = [];
  for (var i = 0; i < nbrClusterCenters; i++) {
    var anchorX = range * Math.random();
    var anchorY = range * Math.random();
    // Add any extra nodes caused by round off on last anchor.
    var nodesForAnchor = i !== nbrClusterCenters - 1 ? nodesPerAnchor : nodesPerAnchor + nbrExtraNodes;
    for (var j = 0; j < nodesForAnchor; j++) {
      /* rand()*(rand() - 0.5) produces normal distribution centered around 0 */
      var xPos = Math.round(anchorX + clusterWidth * (Math.random() * (Math.random() - 0.5)) / 2);
      var yPos = Math.round(anchorY + clusterWidth * (Math.random() * (Math.random() - 0.5)) / 2);
      nodes.push({ id: i * nodesPerAnchor + j, xPos: xPos, yPos: yPos,
        vertices: Array(nbrNodes).fill(0) });
    }
  }

  // Sort nodes based on xPos before connecting them based on position on
  // x axis.
  nodes.sort(function (a, b) {
    return a.xPos - b.xPos;
  });

  for (var _i = 0; _i < nbrNodes; _i++) {
    // All nodes should connect to the previous one except the first node
    if (_i !== 0) {
      nodes[_i].vertices[nodes[_i - 1].id] = 1;
    }

    // All nodes should connect to the next one except the last node
    if (_i !== nbrNodes - 1) {
      nodes[_i].vertices[nodes[_i + 1].id] = 1;
    }

    connectNeighbours(nodes, _i, neighbourRange, { forwards: false, axis: 'x' });
    connectNeighbours(nodes, _i, neighbourRange, { forwards: true, axis: 'x' });
  }

  // At this point all nodes are connected to the graph. Now search for close by node
  // based on y-axis closeness.
  for (var _i2 = 0; _i2 < nbrNodes; _i2++) {
    connectNeighbours(nodes, _i2, neighbourRange, { forwards: false, axis: 'y' });
    connectNeighbours(nodes, _i2, neighbourRange, { forwards: true, axis: 'y' });
  }

  // Sort nodes by id before building adjacency matrix.
  nodes.sort(function (a, b) {
    return a.id - b.id;
  });

  var adjMatrix = [];
  for (var _i3 = 0; _i3 < nbrNodes; _i3++) {
    adjMatrix.push(nodes[_i3].vertices);
  }

  return math.matrix(adjMatrix);
};
