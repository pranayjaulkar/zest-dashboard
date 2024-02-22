"use client";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { useEffect } from "react";
import LoadingBar from "react-top-loading-bar";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingBarProviderProps {}

const LoadingBarProvider: React.FC<LoadingBarProviderProps> = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    loadingBar.done();
  }, [pathname, searchParams]);
  const loadingBar = useLoadingBarStore();
  return (
    <LoadingBar
      color="#f11946"
      height={3}
      progress={loadingBar.progress}
      onLoaderFinished={() => loadingBar.setProgress(0)}
    />
  );
};
export default LoadingBarProvider;
