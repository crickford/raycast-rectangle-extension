import { expect, test } from "vitest";
import { commandGroups, actions } from "./rectangle-pro";

test("All actions are supported", () => {
  const allActions = Object.values(commandGroups)
    .map((group) => group.items)
    .flat()
    .map((item) => item.name);

    expect(allActions.sort()).toContainEqual(actions.toSorted());
});
