import { useEffect, useState } from "react";

type NetworkInformationLike = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
};

function getPerformanceSettings() {
  if (typeof window === "undefined") {
    return {
      allowHeavyMotion: true,
      allowAutoplayVideo: true,
    };
  }

  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as NavigatorWithConnection).connection;
  const saveData = Boolean(connection?.saveData);
  const isSlowNetwork = ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
  const shouldUseLiteMotion =
    mobileQuery.matches || reducedMotionQuery.matches || saveData || isSlowNetwork;
  const shouldDisableAutoplayVideo =
    reducedMotionQuery.matches || saveData || isSlowNetwork;

  return {
    allowHeavyMotion: !shouldUseLiteMotion,
    allowAutoplayVideo: !shouldDisableAutoplayVideo,
  };
}

export function usePerformanceMode() {
  const initialSettings = getPerformanceSettings();
  const [allowHeavyMotion, setAllowHeavyMotion] = useState(initialSettings.allowHeavyMotion);
  const [allowAutoplayVideo, setAllowAutoplayVideo] = useState(initialSettings.allowAutoplayVideo);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const settings = getPerformanceSettings();
      setAllowHeavyMotion(settings.allowHeavyMotion);
      setAllowAutoplayVideo(settings.allowAutoplayVideo);
    };

    update();

    const addListener = (query: MediaQueryList, listener: () => void) => {
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", listener);
        return () => query.removeEventListener("change", listener);
      }

      query.addListener(listener);
      return () => query.removeListener(listener);
    };

    const cleanupMobile = addListener(mobileQuery, update);
    const cleanupMotion = addListener(reducedMotionQuery, update);

    return () => {
      cleanupMobile();
      cleanupMotion();
    };
  }, []);

  return { allowHeavyMotion, allowAutoplayVideo };
}
