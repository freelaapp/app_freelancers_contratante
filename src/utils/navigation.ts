type BackCapableRouter = {
  canGoBack?: () => boolean;
  back: () => void;
  replace?: (href: string) => void;
  push?: (href: string) => void;
};

export function goBackOrReplace(router: BackCapableRouter, fallbackHref: string): void {
  if (router.canGoBack === undefined || router.canGoBack()) {
    router.back();
    return;
  }

  if (router.replace) {
    router.replace(fallbackHref);
    return;
  }

  if (router.push) {
    router.push(fallbackHref);
    return;
  }

  // Fallback for test doubles that only mock back().
  router.back();
}
