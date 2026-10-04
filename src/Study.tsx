"use client";

import { SystemProvider } from "@/system/SystemProvider";
import { Chrome } from "@/chrome/Chrome";
import { Intro } from "@/scenes/Intro";
import { Definition } from "@/scenes/Definition";
import { Stack } from "@/scenes/Stack";
import { Tokens } from "@/scenes/Tokens";
import { Propagation } from "@/scenes/Propagation";
import { Spacing } from "@/scenes/Spacing";
import { Composition } from "@/scenes/Composition";
import { States } from "@/scenes/States";
import { Variants } from "@/scenes/Variants";
import { Entropy } from "@/scenes/Entropy";
import { Sameness } from "@/scenes/Sameness";
import { Themes } from "@/scenes/Themes";
import { Mutation } from "@/scenes/Mutation";
import { Deprecation } from "@/scenes/Deprecation";
import { Governance } from "@/scenes/Governance";
import { Accessibility } from "@/scenes/Accessibility";
import { Scale } from "@/scenes/Scale";
import { Boundaries } from "@/scenes/Boundaries";
import { Network } from "@/scenes/Network";
import { Lab } from "@/scenes/Lab";
import { Finale } from "@/scenes/Finale";

export function Study() {
  return (
    <SystemProvider>
      <Chrome />
      <main>
        <Intro />
        <Definition />
        <Stack />
        <Tokens />
        <Propagation />
        <Spacing />
        <Composition />
        <States />
        <Variants />
        <Entropy />
        <Sameness />
        <Themes />
        <Mutation />
        <Deprecation />
        <Governance />
        <Accessibility />
        <Scale />
        <Boundaries />
        <Network />
        <Lab />
        <Finale />
      </main>
    </SystemProvider>
  );
}
