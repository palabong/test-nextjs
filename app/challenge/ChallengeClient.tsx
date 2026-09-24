"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ChallengeClient({ challengeToken, returnTo }: { challengeToken: string, returnTo: string }) {
  const [status, setStatus] = useState("Verifying your browser...");
  const hasMoved = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const onMove = () => { hasMoved.current = true; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("scroll", onMove);
    
    const runChecks = async () => {
      // 1. Fingerprinting
      const fp: any = {
        webdriver: navigator.webdriver,
        pluginsLen: navigator.plugins.length,
        languages: navigator.languages,
        concurrency: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Canvas Hash
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = "#069";
        ctx.fillText("Antibot", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Challenge", 4, 17);
      }
      const canvasHash = btoa(canvas.toDataURL()).slice(-20); 

      // WebGL
      let webglVendor = "unknown";
      let webglRenderer = "unknown";
      try {
        const gl = document.createElement("canvas").getContext("webgl");
        if (gl) {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch(e) {}

      fp.canvasHash = canvasHash;
      fp.webglVendor = webglVendor;
      fp.webglRenderer = webglRenderer;

      // 2. CDP / Headless signals
      const headlessSignals = {
        hasChrome: !!(window as any).chrome,
        hasPuppeteer: !!(window as any).__puppeteer,
        hasPlaywright: !!(window as any).__playwright,
        hasSelenium: !!(window as any).__selenium || !!(window as any).$cdc_asdjflasutopfhvcZLmcfl_,
        outerAnomalies: window.outerWidth === 0 && window.outerHeight === 0,
      };

      // 3. Challenge answer
      const parts = challengeToken.split('|')[0].split(',');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      const answer = a + b;

      // Wait for movement
      let attempts = 0;
      while (!hasMoved.current && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (!hasMoved.current) {
        setStatus("Verification failed: No interaction detected.");
        return;
      }

      setStatus("Submitting proof...");

      try {
        const res = await fetch("/api/fingerprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeToken,
            answer,
            fingerprint: fp,
            headlessSignals
          })
        });

        if (res.ok) {
          setStatus("Success! Redirecting...");
          window.location.reload(); 
        } else {
          const err = await res.json();
          setStatus(`Verification failed: ${err.error || "Unknown error"}`);
        }
      } catch (e) {
        setStatus("Verification failed: Network error");
      }
    };

    runChecks();
    
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("scroll", onMove);
    }
  }, [challengeToken, returnTo, router]);

  return (
    <div className="p-8 border border-zinc-800 rounded-xl bg-zinc-900 shadow-2xl flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-zinc-600 border-t-zinc-300 rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold mb-2 text-zinc-50">Security Check</h2>
      <p className="text-zinc-400 font-mono text-sm">{status}</p>
    </div>
  );
}