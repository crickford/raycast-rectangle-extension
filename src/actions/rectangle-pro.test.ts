import { expect, test } from "vitest";
import { commandGroups, actions } from "./rectangle-pro";

test("All actions are supported", () => {
  const supportedActions = Object.values(commandGroups)
    .map((group) => group.items)
    .flat()
    .map((item) => item.name);

  expect(supportedActions.toSorted()).toEqual(actions.toSorted());
});

test("All actions are unique", () => {
  const supportedActions = Object.values(commandGroups)
    .map((group) => group.items)
    .flat()
    .map((item) => item.name);

  const counts = new Map();

  for (const action of supportedActions) {
    if (counts.has(action)) {
      counts.set(action, counts.get(action)! + 1);
    } else {
      counts.set(action, 1);
    }
  }

  // filter out actions that are not unique
  const nonUnique = Array.from(counts)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, count]) => count > 1);

  expect(nonUnique).toEqual([]);
});
