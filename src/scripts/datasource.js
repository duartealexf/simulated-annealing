const minDuration = 50;
const maxDuration = 150;
const minEvents = 15;
const maxEvents = 20;
const useMultipleOf = 50;

/**
 * @param {number} num
 * @param {number} multiple
 * @returns {number}
 */
const roundInMultipleOf = (num, multiple) => {
  return Math.round(num / multiple) * multiple;
};

/**
 * @param {number} min
 * @param {number} max
 * @param {number} multipleOf
 * @returns {number}
 */
const random = (min, max, multipleOf) => roundInMultipleOf(min + Math.random() * (max - min), multipleOf);

export const datasource = new Array(random(minEvents, maxEvents, 1))
  .fill(0)
  .map(() => {
    let start = random(-50, 400, useMultipleOf);
    start = Math.max(start, 0);

    let end = random(start + minDuration, 550, useMultipleOf);
    end = Math.min(500, end);
    end = start + Math.min(end - start, maxDuration);

    return { start, end };
  })
  .sort((a, b) => a.start - b.start)
  .map((b, i) => ({ ...b, id: String.fromCharCode(i + 65) }))
  .map((b) => [b]);
