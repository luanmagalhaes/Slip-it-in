"use client";

import { useCallback, useEffect, useState } from "react";

function legacyCopy(text: string): boolean {
  try {
    const field = document.createElement("textarea");

    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);

    const copied = document.execCommand("copy");

    document.body.removeChild(field);

    return copied;
  } catch {
    return false;
  }
}

export function useClipboard(resetMs = 2200) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), resetMs);

    return () => window.clearTimeout(timer);
  }, [copied, resetMs]);

  const copy = useCallback(async (text: string) => {
    let done = false;

    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        done = true;
      } catch {
        done = false;
      }
    }

    if (!done) {
      done = legacyCopy(text);
    }

    setCopied(done);

    return done;
  }, []);

  return { copy, copied };
}
