import { Suspense, lazy, useEffect, useState } from 'react';
import { HeroV2 } from '../components/HeroV2';

const GamesGrid = lazy(() =>
  import('../components/GamesGrid').then((module) => ({
    default: module.GamesGrid,
  })),
);

const Features = lazy(() =>
  import('../components/Features').then((module) => ({
    default: module.Features,
  })),
);

const NetworkMap = lazy(() =>
  import('../components/NetworkMap').then((module) => ({
    default: module.NetworkMap,
  })),
);

export function Home() {
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const revealSections = () => {
      setShowDeferredSections(true);
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(revealSections, { timeout: 250 });
    } else {
      timeoutId = window.setTimeout(revealSections, 180);
    }

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <>
      <HeroV2 />
      {showDeferredSections ? (
        <Suspense
          fallback={
            <div className="bg-zinc-950 px-6 py-24">
              <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <div className="h-36 rounded-3xl border border-white/5 bg-white/[0.03]" />
                <div className="h-36 rounded-3xl border border-white/5 bg-white/[0.03]" />
                <div className="h-36 rounded-3xl border border-white/5 bg-white/[0.03]" />
              </div>
            </div>
          }
        >
          <>
            <div className="[content-visibility:auto] [contain-intrinsic-size:1px_960px]">
              <GamesGrid />
            </div>
            <div className="[content-visibility:auto] [contain-intrinsic-size:1px_960px]">
              <Features />
            </div>
            <div className="[content-visibility:auto] [contain-intrinsic-size:1px_760px]">
              <NetworkMap />
            </div>
          </>
        </Suspense>
      ) : (
        <div className="bg-zinc-950 px-6 py-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <div className="h-36 rounded-3xl border border-white/5 bg-white/[0.03]" />
            <div className="h-36 rounded-3xl border border-white/5 bg-white/[0.03]" />
            <div className="h-36 rounded-3xl border border-white/5 bg-white/[0.03]" />
          </div>
        </div>
      )}
    </>
  );
}
