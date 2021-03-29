# Simulate Annealing

This project uses [Simulate Annealing](https://en.wikipedia.org/wiki/Simulated_annealing) technique, to optimize a scheduling table, to use as few rows as possible.

Initially, the table contains one event per row. An event has a starting and ending time.

It optimizes and moves the events up and down (it does not change start end end values) until it finds the solution that is closer to best.

Rules to find best solution, and how the acceptance function treats each solution:

- Events cannot overlap: acceptance function places a huge penalty for each overlap.
- The more events are in a row, the better: acceptance penalty is based on total space available.
- The less rows occupied, the better: acceptance penalty for each row.

It runs the optimization in a WebWorker so it does not block the main thread. As it goes through the solutions it renders progress on the browser.

## Requirements

- NodeJS 10+
- Any modern browser

## Setup

- Clone this repository.
- `npm i`
- `npm run start`

## Credits

The code for the Simulate Annealing algorithm is credited to [saveryanov/simulated-annealing repository](https://github.com/saveryanov/simulated-annealing).
