import { useEffect, useRef } from "react";

// Closes a dialog once a useActionState submission finishes without an
// error. Needed because the `state` returned by useActionState only
// reflects the latest completed submission on the render *after* it
// settles, so we can't just check `state.error` synchronously on submit.
export function useCloseOnSuccess(isPending: boolean, error: string | undefined, close: () => void) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !error) {
      close();
    }
    wasPending.current = isPending;
  }, [isPending, error, close]);
}
