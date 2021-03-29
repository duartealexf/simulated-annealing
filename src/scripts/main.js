import { datasource } from "./datasource.js";

/**
 * @typedef {{start: number, end: number, id: string}} Block
 */

/**
 * @param {number} num
 * @returns {string}
 */
export const toPX = (num) => `${num}px`;

/**
 * @type {HTMLTemplateElement}
 */
export const rowTemplate = document.getElementById("row-template");

/**
 * @type {HTMLTemplateElement}
 */
export const blockTemplate = document.getElementById("block-template");

/**
 * @type {HTMLTemplateElement}
 */
export const hourTemplate = document.getElementById("hour-template");

/**
 * @type {HTMLDivElement}
 */
export const initialTable = document.getElementById("initial-table");

/**
 * @type {HTMLDivElement}
 */
export const optimizedTable = document.getElementById("optimized-table");

/**
 * @type {HTMLDivElement[]}
 */
export const hoursContainers = Array.from(document.querySelectorAll(".hours"));

const getPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const lightness = Math.floor(Math.random() * 16) + 75;
  return `hsl(${hue}, 100%, ${lightness}%)`;
}

/**
 * @param {number} hour
 * @param {number} minutes
 */
const addHourElement = (hour, minutes) => {
  const date = new Date(1970, 0, 1, hour, minutes);
  const timeString = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;

  const hourClone = hourTemplate.content.cloneNode(true);
  const hourElement = hourClone.querySelector(".hour");

  hourElement.innerText = timeString;
  hourElement.style.marginLeft = toPX(100 * (hour - 1 + minutes / 60));

  hoursContainers[0].appendChild(hourElement);
  hoursContainers[1].appendChild(hourElement.cloneNode(true));
};

/**
 * @returns {void}
 */
const addHours = () => {
  Array(11)
    .fill(0)
    .map((_, i) => {
      const hour = Math.floor(1 + i / 2);
      const minutes = i % 2 ? 30 : 0;

      addHourElement(hour, minutes);
    });
}

/**
 * @param {Block[]} blocks
 */
const feedAndGetRow = (blocks) => {
  const rowClone = rowTemplate.content.cloneNode(true);

  blocks.forEach((block) => {
    const blockClone = blockTemplate.content.cloneNode(true);
    /**
     * @type {HTMLElement}
     */
    const blockElement = blockClone.querySelector(".block");
    blockElement.innerText = block.id;
    blockElement.style.marginLeft = toPX(block.start);
    blockElement.style.width = toPX(block.end - block.start);
    blockElement.style.backgroundColor = getPastelColor();
    rowClone.querySelector(".row").appendChild(blockElement);
  });

  return rowClone;
};

/**
 * @param {Block[][]} matrix
 * @param {HTMLElement} tableElement
 */
const renderTable = (matrix, tableElement) => {
  tableElement.innerHTML = "";

  matrix.forEach((row) => {
    tableElement.appendChild(feedAndGetRow(row));
  });
}

const startTime = new Date();

const reportTimeTaken = () => {
  const element = document.getElementById('time-taken');
  element.innerText = `Optimized in ${new Date().getTime() - startTime.getTime()} ms`;
}

addHours();
renderTable(datasource, initialTable);

const worker = new Worker("scripts/worker.js");

worker.onmessage = (message) => {
  if (message.data.isFinal) {
    reportTimeTaken();
    renderTable(message.data.value, optimizedTable);
  }
};

worker.postMessage([datasource, 1000]);
