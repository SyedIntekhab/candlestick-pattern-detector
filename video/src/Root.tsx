import { Composition } from "remotion";
import { Promo } from "./Promo";
import { MembersLoop } from "./MembersLoop";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EdCirclesPromo"
        component={Promo}
        durationInFrames={390}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MembersLoop"
        component={MembersLoop}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
