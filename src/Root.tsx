import { Composition } from "remotion";
import { Reel } from "./Reel";
import { BrandCheck } from "./BrandCheck";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="BrandCheck"
      component={BrandCheck}
      durationInFrames={60}
      fps={30}
      width={1080}
      height={1920}
    />
    </>
  );
};
