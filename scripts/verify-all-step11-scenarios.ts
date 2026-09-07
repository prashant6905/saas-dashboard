import { spawn } from "node:child_process";
import fs from "node:fs";

interface ScenarioResult {
  name: string;
  passed: boolean;
  message: string;
  details: any;
}

async function runAllTests() {
  console.log("=========================================================================");
  console.log("🚀 VERIFYING ALL STEP 11 SIGNUP FLOW SCENARIOS IN REAL CHROME");
  console.log("=========================================================================\n");

  const tempProfileDir = "C:\\Users\\hp\\AppData\\Local\\Temp\\chrome-step11-" + Date.now();
  fs.mkdirSync(tempProfileDir, { recursive: true });

  const chromeProc = spawn(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      `--user-data-dir=${tempProfileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "pipe" }
  );

  let version = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      if (res.ok) {
        version = await res.json();
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!version) {
    throw new Error("Could not connect to Chrome CDP");
  }

  const results: ScenarioResult[] = [];

  // Helper function to run a scenario
  async function testScenario(
    testName: string,
    inputs: { name?: string; email?: string; pass?: string; confirm?: string },
    verify: (state: any) => { passed: boolean; message: string }
  ) {
    // Open fresh tab and clear cookies
    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000/signup", {
      method: "PUT",
    });
    const tab = await newTabRes.json();
    const ws = new globalThis.WebSocket(tab.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map<number, (val: any) => void>();
    function send(method: string, params: any = {}): Promise<any> {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onmessage = (evt: any) => {
      const data = JSON.parse(evt.data.toString());
      if (data.id && callbacks.has(data.id)) {
        const cb = callbacks.get(data.id)!;
        callbacks.delete(data.id);
        cb(data);
      }
    };

    await new Promise<void>((r) => { ws.onopen = () => r(); });
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");

    // Clear cookies for fresh session
    await send("Network.clearBrowserCookies");

    // Navigate to /signup
    await send("Page.navigate", { url: "http://localhost:3000/signup" });
    await new Promise((r) => setTimeout(r, 2000));

    // Fill form and submit
    await send("Runtime.evaluate", {
      expression: `(async () => {
        const nameInput = document.querySelector('input[type="text"]') || document.querySelector('input[placeholder*="Name" i]');
        const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="Email" i]');
        const passInputs = Array.from(document.querySelectorAll('input[type="password"]'));
        const submitBtn = document.querySelector('button[type="submit"]');

        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        
        if (nameInput && ${JSON.stringify(inputs.name ?? "")}) {
          nativeSetter.call(nameInput, ${JSON.stringify(inputs.name ?? "")});
          nameInput.dispatchEvent(new Event("input", { bubbles: true }));
          nameInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        if (emailInput && ${JSON.stringify(inputs.email ?? "")}) {
          nativeSetter.call(emailInput, ${JSON.stringify(inputs.email ?? "")});
          emailInput.dispatchEvent(new Event("input", { bubbles: true }));
          emailInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        if (passInputs[0] && ${JSON.stringify(inputs.pass ?? "")}) {
          nativeSetter.call(passInputs[0], ${JSON.stringify(inputs.pass ?? "")});
          passInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
          passInputs[0].dispatchEvent(new Event("change", { bubbles: true }));
        }

        if (passInputs[1] && ${JSON.stringify(inputs.confirm ?? "")}) {
          nativeSetter.call(passInputs[1], ${JSON.stringify(inputs.confirm ?? "")});
          passInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
          passInputs[1].dispatchEvent(new Event("change", { bubbles: true }));
        }

        await new Promise(r => setTimeout(r, 150));
        if (submitBtn) submitBtn.click();
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    // Wait for response/navigation
    await new Promise((r) => setTimeout(r, 3500));

    const stateRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const errorEl = document.querySelector('.text-rose-600, .text-rose-400');
        const successEl = document.querySelector('.text-emerald-600, .text-emerald-400');
        return {
          url: window.location.href,
          pathname: window.location.pathname,
          errorText: errorEl ? errorEl.textContent.trim() : null,
          successText: successEl ? successEl.textContent.trim() : null,
          cookie: document.cookie
        };
      })()`,
      returnByValue: true,
    });

    const state = stateRes.result?.result?.value;
    const v = verify(state);
    results.push({
      name: testName,
      passed: v.passed,
      message: v.message,
      details: state,
    });

    console.log(`${v.passed ? "✅ PASS" : "❌ FAIL"} - ${testName}`);
    console.log(`     ${v.message}`);
    console.log(`     URL: ${state?.url}, Error: ${state?.errorText || "none"}\n`);

    ws.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);
  }

  // 1. Password Mismatch
  await testScenario(
    "15. Attempt mismatched passwords",
    {
      name: "Mismatch Test",
      email: "mismatch@example.com",
      pass: "Password123!",
      confirm: "Different123!",
    },
    (state) => ({
      passed: state?.errorText?.includes("Passwords do not match") && state?.pathname === "/signup",
      message: `Expected mismatch error message, got: "${state?.errorText}"`,
    })
  );

  // 2. Invalid Password (< 8 chars)
  await testScenario(
    "14. Attempt invalid password (< 8 chars)",
    {
      name: "Short Pass Test",
      email: "shortpass@example.com",
      pass: "short",
      confirm: "short",
    },
    (state) => ({
      passed: state?.errorText?.includes("at least 8 characters") && state?.pathname === "/signup",
      message: `Expected min-length error message, got: "${state?.errorText}"`,
    })
  );

  // 3. Invalid Email Format
  await testScenario(
    "16. Attempt invalid email",
    {
      name: "Bad Email Test",
      email: "notanemail",
      pass: "Password123!",
      confirm: "Password123!",
    },
    (state) => ({
      passed: state?.errorText?.includes("valid email address") && state?.pathname === "/signup",
      message: `Expected valid email error message, got: "${state?.errorText}"`,
    })
  );

  // 4. Existing Email
  await testScenario(
    "13. Attempt signup with an existing email",
    {
      name: "Duplicate Test",
      email: "admin@commandcenter.io",
      pass: "Password123!",
      confirm: "Password123!",
    },
    (state) => ({
      passed: state?.errorText?.includes("already exists") && state?.pathname === "/signup",
      message: `Expected already exists error message, got: "${state?.errorText}"`,
    })
  );

  // 5. New Valid Account Creation & Redirect
  const uniqueEmail = `new_lead_${Date.now()}@commandcenter.io`;
  await testScenario(
    "1-12. New Valid Signup Flow, Session Creation & Redirect",
    {
      name: "Eleanor Vance",
      email: uniqueEmail,
      pass: "SecurePassword2026!",
      confirm: "SecurePassword2026!",
    },
    (state) => ({
      passed: state?.pathname === "/dashboard" && state?.cookie?.includes("cc_auth_session"),
      message: `Successfully created account for ${uniqueEmail}, session cookie established, redirected to /dashboard`,
    })
  );

  chromeProc.kill();
  try { fs.rmSync(tempProfileDir, { recursive: true, force: true }); } catch {}

  const allPassed = results.every((r) => r.passed);
  console.log("=========================================================================");
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} Scenarios Passed`);
  console.log(`OVERALL: ${allPassed ? "ALL SCENARIOS PASSED ✅" : "SOME SCENARIOS FAILED ❌"}`);
  console.log("=========================================================================");

  if (!allPassed) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
