"use client";

import { useEffect, useRef } from "react";

export default function TurnstileWidget({ onVerify }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    function renderWidget() {
      if (window.turnstile && containerRef.current && widgetId.current === null) {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onVerify(token),
          "expired-callback": () => onVerify(null),
          "error-callback": () => onVerify(null),
        });
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.getElementById("cf-turnstile-script");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.onload = renderWidget;
        document.body.appendChild(script);
      } else {
        existing.addEventListener("load", renderWidget);
      }
    }

    return () => {
      if (window.turnstile && widgetId.current !== null) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (e) {}
        widgetId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!siteKey) return null;

  return <div ref={containerRef} style={{ margin: "14px 0" }} />;
}
