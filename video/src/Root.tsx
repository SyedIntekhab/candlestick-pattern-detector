import { Composition } from "remotion";
import { Promo } from "./Promo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EdCirclesPromo"
      component={Promo}
      durationInFrames={390}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
