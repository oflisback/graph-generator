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

function connectNeighbours(nodes, i, forwards, range, axis) {
  var c = forwards ? Math.min(nodes.length, i + 1) : Math.max(0, i - 1);
  var cBreak = forwards ? nodes.length : 0;
  while (c !== cBreak && axisDistance(nodes[i], nodes[c], axis) < range) {
    if (withinPlaneRange(nodes[i], nodes[c], range)) {
      nodes[i].vertices[nodes[c].id] = 1;
    }
    c = c + (forwards ? 1 : -1);
  }
}

_exports.generateGraph = function generateGraph(options) {
  var opt = options || {};
  var nbrNodes = opt.nbrNodes || 10;
  var distanceFactor = opt.distanceFactor || 1;
  var spacing = 100;
  var neighbourRange = spacing * distanceFactor;
  var nodes = [];
  var adjMatrix = [];

  // Randomly place all nodes within a large range
  for (var i = 0; i < nbrNodes; i++) {
    // Nodes with identical position is ok
    var xPos = Math.floor(Math.random() * (spacing * nbrNodes + 1));
    var yPos = Math.floor(Math.random() * (spacing * nbrNodes + 1));
    nodes.push({ id: i, xPos: xPos, yPos: yPos, vertices: Array(nbrNodes).fill(0) });
  }

  // Sort nodes based on xPos
  nodes.sort(function (a, b) {
    return a.xPos - b.xPos;
  });

  for (var _i = 0; _i < nbrNodes; _i++) {
    connectNeighbours(nodes, _i, false, neighbourRange, 'x');

    // All nodes should connect to the previous one except the first node
    if (_i !== 0) {
      nodes[_i].vertices[nodes[_i - 1].id] = 1;
    }

    // All nodes should connect to the next one except the last node
    if (_i !== nbrNodes - 1) {
      nodes[_i].vertices[nodes[_i + 1].id] = 1;
    }

    connectNeighbours(nodes, _i, true, neighbourRange, 'x');
  }

  // At this point all nodes are connected to the graph. Now search for close by node
  // based on y-axis closeness.
  for (var _i2 = 0; _i2 < nbrNodes; _i2++) {
    connectNeighbours(nodes, _i2, false, neighbourRange, 'y');

    connectNeighbours(nodes, _i2, true, neighbourRange, 'y');
  }

  // Sort nodes by id
  nodes.sort(function (a, b) {
    return a.id - b.id;
  });
  for (var _i3 = 0; _i3 < nbrNodes; _i3++) {
    adjMatrix.push(nodes[_i3].vertices);
  }

  return math.matrix(adjMatrix);
};
