/**
 * The one file that knows a `DialogueSystem` lives inside a Phaser scene.
 *
 * WHY IT IS SEPARATE. `DialogueSystem` imports no Phaser, which is what lets
 * vitest drive it against `FakeDialogueRenderPort` with no canvas. If the scene
 * wiring lived in that class, importing it into a test would pull the engine in
 * and the whole seam would be decorative. So the three Phaser facts — build the
 * port, release on scene shutdown, relayout on resize — are here and nowhere
 * else.
 *
 * RELEASE IS NOT OPTIONAL. Phaser does not run our teardown for us, and the
 * system holds a bus subscription that would outlive the scene and draw into a
 * dead canvas. Both `SHUTDOWN` and `DESTROY` are hooked, and everything the
 * mount added is unwound through the port's single `detach()` — so a scene that
 * calls `dialogue.destroy()` itself gets the same complete release as one that
 * just shuts down.
 */

import Phaser from "phaser";
import { DialogueSystem, type DialogueSystemOptions } from "./DialogueSystem";
import { PhaserDialogueRenderPort } from "./PhaserDialogueRenderPort";

export interface MountDialogueOptions extends DialogueSystemOptions {
  /** Draw depth for the whole layer. Above backdrops, below modals. */
  readonly depth?: number;
  /** Recompute the layout when the canvas resizes. Default true. */
  readonly followResize?: boolean;
}

export function mountDialogue(
  scene: Phaser.Scene,
  bus: ConstructorParameters<typeof DialogueSystem>[1],
  options: MountDialogueOptions = {},
): DialogueSystem {
  const port = new PhaserDialogueRenderPort(scene, {
    depth: options.depth,
    view: options.view,
  });
  const dialogue = new DialogueSystem(port, bus, options);

  const onShutdown = () => dialogue.destroy();
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
  scene.events.once(Phaser.Scenes.Events.DESTROY, onShutdown);

  // A fixed view was asked for explicitly, so resizing must not override it.
  const onResize = (size: Phaser.Structs.Size) =>
    dialogue.relayout({ width: size.width, height: size.height });
  const follows = options.followResize !== false && !options.view;
  if (follows) scene.scale.on(Phaser.Scale.Events.RESIZE, onResize);

  port.addCleanup(() => {
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    scene.events.off(Phaser.Scenes.Events.DESTROY, onShutdown);
    if (follows) scene.scale.off(Phaser.Scale.Events.RESIZE, onResize);
  });

  return dialogue;
}
