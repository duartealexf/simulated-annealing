/**
 * @typedef {{start: number, end: number, id: string}} Block
 */

/**
 * @param {Block[]} arr
 * @param {number} firstIndex
 * @param {number} secondIndex
 * @returns {Block[]}
 */
const swapBlocks = (arr, firstIndex, secondIndex) => {
  const temp = arr[firstIndex];

  arr[firstIndex] = arr[secondIndex];
  arr[secondIndex] = temp;

  return arr;
};

/**
 * @param {Block[]} arr
 * @returns {Block[]}
 */
const cloneArray = (arr) => [...arr];

/**
 * @param {Block[][]} arr
 * @returns {Block[][]}
 */
const cloneMatrix = (arr) => [...arr.map(cloneArray)];

/**
 * @param {Block[] | Block[][]} blocks
 * @returns {number}
 */
const getRandomIndex = (blocks) => Math.floor(Math.random() * blocks.length);

/**
 * @param {Block[] | Block[][]} arr
 * @returns {[number, number]}
 */
const getTwoRandomIndexes = (arr) => {
  const firstMatrixIndex = getRandomIndex(arr);
  let secondMatrixIndex = firstMatrixIndex;

  while (secondMatrixIndex === firstMatrixIndex) {
    secondMatrixIndex = getRandomIndex(arr);
  }
  return [firstMatrixIndex, secondMatrixIndex];
};

/**
 * @param {Block[] | Block[][]} arr
 * @param {number} index
 * @returns {[Block, Block[] | Block[][]]}
 */
const removeBlock = (arr, index) => {
  return [arr[index], [...arr.slice(0, index), ...arr.slice(index + 1)]];
};

/**
 * @param {Block[]} arr
 * @returns {[Block, Block[]]}
 */
const removeRandomBlock = (arr) => {
  const index = getRandomIndex(arr);
  return [arr[index], [...arr.slice(0, index), ...arr.slice(index + 1)]];
};

/**
 * @param {Block[]} arr
 * @returns {Block}
 */
const getRandomBlock = (arr) => {
  const index = getRandomIndex(arr);
  return arr[index];
};

/**
 * @param {number} sides
 * @returns {number}
 */
const rollDice = (sides) => 1 + Math.floor(Math.random() * sides);

/**
 * Slightly modified version of https://github.com/saveryanov/simulated-annealing
 * @param {Block[][]} initialState
 * @param {number} tempMax
 * @param {number} tempMin
 * @param {(value: Block[][]) => Promise<Block[][]>} neighborFn
 * @param {(number) => number} getUpdatedTemp
 * @param {(value: Block[][]) => Promise<number>} acceptanceFn
 * @returns {Promise<{value: Block[][]}>}
 */
const sa = async (initialState, tempMax, tempMin, neighborFn, getUpdatedTemp, acceptanceFn) => {
  let currentTemp = tempMax;

  let lastState = initialState;
  let lastEnergy = await acceptanceFn(lastState);

  let bestState = lastState;
  let bestEnergy = lastEnergy;

  let i = 0;

  while (currentTemp > tempMin) {
    let currentState = await neighborFn(lastState);
    let currentEnergy = await acceptanceFn(currentState);

    if (currentEnergy < lastEnergy) {
      lastState = currentState;
      lastEnergy = currentEnergy;
    } else {
      if (Math.random() <= Math.exp(-(currentEnergy - lastEnergy) / currentTemp)) {
        lastState = currentState;
        lastEnergy = currentEnergy;
      }
    }

    if (bestEnergy > lastEnergy) {
      bestState = lastState;
      bestEnergy = lastEnergy;
    }

    if (i % 10 === 0) {
      await new Promise((resolve) => {
        setTimeout(() => {
          postMessage({ value: currentState });
          resolve();
        }, 0);
      });
    }

    currentTemp = getUpdatedTemp(currentTemp);
    i++;
  }

  return bestState;
};

/**
 * @param {Block} block1
 * @param {Block} block2
 * @returns {number}
 */
function getOverlapBetweenBlocks(block1, block2) {
  return Math.max(Math.min(block1.end, block2.end) - Math.max(block1.start, block2.start), 0);
}

/**
 * @param  {Block[]} blocks
 * @returns {number}
 */
function getSpaceOccupiedByBlocks(...blocks) {
  return Math.max(...blocks.map((b) => b.end)) - Math.min(...blocks.map((b) => b.start));
}

/**
 * @param {Block[][]} matrix
 * @returns {Block[][]}
 */
function moveRandomBlockToAnotherRow(matrix) {
  const [randomIndex1FromMatrix, randomIndex2FromMatrix] = getTwoRandomIndexes(matrix);
  const randomIndexFromRow2 = getRandomIndex(matrix[randomIndex2FromMatrix]);

  const [row2RandomItem, row2HavingRemovedItem] = removeBlock(matrix[randomIndex2FromMatrix], randomIndexFromRow2);

  matrix[randomIndex1FromMatrix].push(row2RandomItem);
  matrix[randomIndex2FromMatrix] = row2HavingRemovedItem;

  return matrix;
}

/**
 * @param {Block[][]} matrix
 * @returns {Block[][]}
 */
function swapTwoBlocksFromRows(matrix) {
  const [randomIndex1FromMatrix, randomIndex2FromMatrix] = getTwoRandomIndexes(matrix);
  const randomIndexFromRow1 = getRandomIndex(matrix[randomIndex1FromMatrix]);
  const randomIndexFromRow2 = getRandomIndex(matrix[randomIndex2FromMatrix]);

  const temp = matrix[randomIndex1FromMatrix][randomIndexFromRow1];
  matrix[randomIndex1FromMatrix][randomIndexFromRow1] = matrix[randomIndex2FromMatrix][randomIndexFromRow2];
  matrix[randomIndex2FromMatrix][randomIndexFromRow2] = temp;

  return matrix;
}

/**
 * @param {Block[][]} matrix
 * @returns {Block[][]}
 */
function removeBlockFromRowAndAddAsAnotherRow(matrix) {
  const randomIndexToRemoveRowFromMatrix = getRandomIndex(matrix);
  const [removedRowFromMatrix, matrixHavingRemovedRow] = removeBlock(matrix, randomIndexToRemoveRowFromMatrix);
  matrix = matrixHavingRemovedRow;

  const randomIndexToRemoveItemFromRow = getRandomIndex(removedRowFromMatrix);
  const [removedRowItem, rowHavingRemovedItem] = removeBlock(removedRowFromMatrix, randomIndexToRemoveItemFromRow);

  matrix.push([removedRowItem]);
  matrix.push(rowHavingRemovedItem);

  return matrix;
}

/**
 * @param {Block[][]} matrix
 * @returns {Promise<number>}
 */
const acceptance = async (matrix) => {
  let totalOverlap = 1;

  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    for (let j = 0; j < row.length; j++) {
      for (let k = j + 1; k < row.length; k++) {
        totalOverlap += getOverlapBetweenBlocks(row[j], row[k]);
      }
    }
  }

  const overlapPenalty = Math.pow(totalOverlap, 3);

  let spaceLeftover = 0;
  for (let i = 0; i < matrix.length; i++) {
    spaceLeftover += getSpaceOccupiedByBlocks(...matrix[i]);
  }

  const matrixLengthPenalty = 500 * matrix.length;

  return overlapPenalty + matrixLengthPenalty + spaceLeftover;
};

/**
 * @param {Block[][]} original
 * @returns {Promise<Block[][]>}
 */
const neighbor = async (original) => {
  let matrix = cloneMatrix(original);
  const minimumRows = 3;

  const diceRoll = rollDice(6);

  if (diceRoll === 1 || matrix.length <= minimumRows) {
    matrix = removeBlockFromRowAndAddAsAnotherRow(matrix);
  } else if (diceRoll === 2 || diceRoll === 3 || diceRoll === 4) {
    matrix = swapTwoBlocksFromRows(matrix);
  } else {
    matrix = moveRandomBlockToAnotherRow(matrix);
  }

  return matrix.filter((row) => row.length > 0);
};

onmessage = async (message) => {
  const result = await sa(message.data[0], message.data[1], 0, neighbor, (t) => t - 1, acceptance);
  postMessage({ value: result, isFinal: true });
};
