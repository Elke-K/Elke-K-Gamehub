import { refreshRawgCache } from "./loadRawgCache";

export async function startCacheWorker() {
  let isRefreshing = false;

  const refreshSafely = async () => {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      await refreshRawgCache();
    } catch (error) {
      console.error("Failed to refresh RAWG cache", error);
    } finally {
      isRefreshing = false;
    }
  };

  await refreshSafely();

  setInterval(() => {
    void refreshSafely();
  }, 1000 * 60 * 10);
}