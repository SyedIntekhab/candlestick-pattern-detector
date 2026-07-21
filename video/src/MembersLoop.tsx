import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, SceneBackground } from "./scene";

// Text-free background loop for the Members page hero. Deliberately carries
// no words of its own: the page's live HTML (headings, mottos, buttons,
// forms) sits on top of it, so baking text into the video would double up
// and fight for the same space. Just the moving photo, the living seam of
// light, and the floating doodles, looping seamlessly.
export const MembersLoop: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <SceneBackground />
    </AbsoluteFill>
  );
};
