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
import { RectangleAction, commandGroups } from "./actions/rectangle";

export default function Command() {
  ensureRectangleIsInstalled();

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

export const buildCommand = (action: RectangleAction) => async () => {
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
