import { signSessionPayload } from "../lib/auth/session-crypto";

async function testAllAuthenticatedPages() {
  console.log("Testing authenticated pages at http://localhost:3000...\n");

  const adminToken = await signSessionPayload({
    id: "usr_admin_live_test",
    email: "admin@commandcenter.io",
    name: "Aarav Sharma",
    role: "ADMIN",
  });

  const cookie = `cc_auth_session=${adminToken}`;

  const pages = [
    { path: "/dashboard", expectINR: true },
    { path: "/analytics", expectINR: true },
    { path: "/orders", expectINR: true },
    { path: "/orders/ord_00001", expectINR: true },
    { path: "/products", expectINR: true },
    { path: "/products/prod_0001", expectINR: true },
    { path: "/customers", expectINR: true },
    { path: "/customers/cust_0001", expectINR: true },
    { path: "/settings", expectINR: false },
  ];

  let allPassed = true;

  for (const page of pages) {
    const res = await fetch(`http://localhost:3000${page.path}`, {
      headers: { cookie },
    });
    const html = await res.text();
    const hasError =
      html.includes("maximumFractionDigits") ||
      html.includes("RangeError") ||
      res.status >= 400;
    const hasINR = html.includes("₹");
    const passed = !hasError && (!page.expectINR || hasINR);

    console.log(
      `Page ${page.path.padEnd(24)} | Status: ${res.status} | Has ₹: ${String(hasINR).padEnd(5)} | RangeError: ${
        html.includes("maximumFractionDigits") ? "FOUND!" : "NONE"
      } | Result: ${passed ? "✅ PASS" : "❌ FAIL"}`
    );

    if (!passed) {
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log("\n=========================================");
    console.log("🎉 ALL PAGES VERIFIED 100% OPERATIONAL WITH ₹ (INR)!");
    console.log("=========================================");
  } else {
    console.error("\nSome pages failed!");
    process.exit(1);
  }
}

testAllAuthenticatedPages().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
