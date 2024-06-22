"use client";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { useEffect } from "react";
import LoadingBar from "react-top-loading-bar";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingBarProviderProps {
  color?: string;
  height?: number;
}

const LoadingBarProvider: React.FC<LoadingBarProviderProps> = ({ color, height, ...props }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loadingBar = useLoadingBarStore();
  useEffect(() => {
    if (loadingBar.progress) loadingBar.done();
  }, [pathname, searchParams]);
  return (
    <LoadingBar
      height={height || 2}
      progress={loadingBar.progress}
      onLoaderFinished={() => loadingBar.setProgress(0)}
      {...props}
    />
  );
};
export default LoadingBarProvider;
