import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";
import { createAnimations } from "@tamagui/animations-css";

const animations = createAnimations({
  fast: "ease-in 150ms",
  medium: "ease-in 300ms",
  slow: "ease-in 450ms",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55) 400ms",
  lazy: "ease-out 600ms",
  quick: "ease-out 100ms",
});

export const tamaguiConfig = createTamagui({
  ...config,
  animations,
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
