const expect = require('chai').expect;
const gg = require('../index.js');
const math = require('mathjs');

describe('Graph generator tests', () => {
  it('Generates random graph, verifies size, diagonal and symmetry', () => {
    const nbrNodes = 10;
    const adjMatrix = gg.generateGraph({ nbrNodes });
    const transposed = math.transpose(adjMatrix);

    expect(adjMatrix.size()).to.deep.equal([nbrNodes, nbrNodes]);
    expect(math.deepEqual(adjMatrix, transposed)).to.equal(true);
    expect(math.deepEqual(math.zeros(nbrNodes), math.diag(adjMatrix)));
  });

  it('Verifies that all nodes have a neighbour i.e. min(rowSum) >= 1', () => {
    const nbrNodes = 10;
    const adjMatrix = gg.generateGraph({ nbrNodes });

    expect(math.min(math.multiply(adjMatrix, math.ones(nbrNodes))) >= 1);
  });

  it('Verifies creation of a large matrix', () => {
    const nbrNodes = 1000;
    const adjMatrix = gg.generateGraph({ nbrNodes });
    const transposed = math.transpose(adjMatrix);

    expect(adjMatrix.size()).to.deep.equal([nbrNodes, nbrNodes]);
    expect(math.deepEqual(adjMatrix, transposed)).to.equal(true);
    expect(math.deepEqual(math.zeros(nbrNodes), math.diag(adjMatrix)));
    expect(math.min(math.multiply(adjMatrix, math.ones(nbrNodes))) >= 1);
  });
});
