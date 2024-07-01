import {
  open,
  captureException,
  showToast,
  Toast,
  Action,
  getFrontmostApplication,
  closeMainWindow,
  Grid,
  ActionPanel,
} from "@raycast/api";
import { ensureRectangleIsInstalled } from "./utils/checkInstall";
import { CommandGroups } from "./actions/interface";
import { RectangleAction, commandGroups as rectangleCommandGroups } from "./actions/rectangle";
import { RectangleProAction, commandGroups as rectangleProCommandGroups } from "./actions/rectangle-pro";
import { useEffect, useState } from "react";

type AllCommandGroups = CommandGroups<RectangleAction | RectangleProAction>

export default function Command() {
  const [commandGroups, setCommandGroups] = useState<AllCommandGroups>(rectangleCommandGroups);

  useEffect(() => {
    ensureRectangleIsInstalled().then((detectionResult) => {
      if (detectionResult === "rectangle-pro") {
        setCommandGroups(rectangleProCommandGroups);
      } else if (detectionResult === "rectangle") {
        setCommandGroups(rectangleCommandGroups);
      } else {
        // Handle cases where Rectangle is not installed or detection failed
        // TODO: Add a "Download Rectangle" action to the command group
      }
    });
  }, []);

  return (
    <Grid inset={Grid.Inset.Medium} searchBarPlaceholder="Find a Rectangle action">
      {Object.values(commandGroups).map((group) => (
        <Grid.Section title={group.title} key={group.title}>
          {group.items.map(({ name, title, icon, description }) => (
            <Grid.Item
              key={name}
              content={{
                value: {
                  source: {
                    light: icon,
                    dark: icon.replace(".png", "@dark.png"),
                  },
                },
                tooltip: description,
              }}
              title={title}
              subtitle={description}
              actions={
                <ActionPanel>
                  <Action title={`Execute ${title}`} onAction={() => buildCommand(name)()} />
                </ActionPanel>
              }
            />
          ))}
        </Grid.Section>
      ))}
    </Grid>
  );
}

export const buildCommand = (action: RectangleAction | RectangleProAction) => async () => {
  const installedVersion = await ensureRectangleIsInstalled();

  // bail out early if Rectangle is not found
  if (installedVersion === "none") {
    return;
  }

  const url = `${installedVersion}://execute-action?name=${action}`;

  try {
    await getFrontmostApplication();
  } catch (e: unknown) {
    captureException(e);
    await showToast({
      style: Toast.Style.Failure,
      title: `Failed to run action "${action}: unable to obtain focused window"`,
    });
    return;
  }

  await closeMainWindow();

  try {
    await open(url);
  } catch (e: unknown) {
    captureException(e);
    await showToast({
      style: Toast.Style.Failure,
      title: `Failed to run action "${action}"`,
    });
  }
};
