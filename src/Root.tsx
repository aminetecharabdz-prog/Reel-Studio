import { Composition } from "remotion";
import { BrandPreview } from "./BrandPreview";
import { CardCaption } from "./CardCaption";
import { DaftariReel } from "./daftari/DaftariReel";
import { timeline } from "./daftari/timeline";
import { Reel } from "./Reel";

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
      id="BrandPreview"
      component={BrandPreview}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="CardCaption"
      component={CardCaption}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="Daftari"
      component={DaftariReel}
      durationInFrames={timeline.durationInFrames}
      fps={30}
      width={1080}
      height={1920}
    />
    </>
  );
};
