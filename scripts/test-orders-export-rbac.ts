const BASE_URL = "http://localhost:3000";
const COOKIE_NAME = "cc_auth_session";

const adminUser = {
  id: "usr_admin_001",
  email: "admin@commandcenter.io",
  name: "Alex Administrator",
  role: "ADMIN",
};

const viewerUser = {
  id: "usr_viewer_001",
  email: "viewer@commandcenter.io",
  name: "Victor Viewer",
  role: "VIEWER",
};

const adminCookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(adminUser))}`;
const viewerCookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(viewerUser))}`;

async function runRBACTests() {
  console.log("🛡️ Running Step 15 RBAC Authorization Tests for Orders CSV Export...\n");

  // =========================================================================
  // TEST 1: Admin Can Export Filtered Orders via POST /api/export
  // =========================================================================
  console.log("--- Test 1: Admin Authorized Export (Filtered POST) ---");
  const adminPostRes = await fetch(`${BASE_URL}/api/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      type: "orders",
      status: "Delivered",
      region: "Europe",
      scope: "page",
      page: 1,
      pageSize: 20,
    }),
  });

  console.log(`Admin POST /api/export -> HTTP Status: ${adminPostRes.status}`);
  if (adminPostRes.status !== 200) {
    throw new Error(`Expected HTTP 200 for Admin export, got ${adminPostRes.status}`);
  }

  const disposition = adminPostRes.headers.get("content-disposition") || "";
  console.log(`Content-Disposition: ${disposition}`);
  if (!disposition.includes("filename=") || !disposition.includes("filtered")) {
    throw new Error(`Unexpected disposition: ${disposition}`);
  }

  const rawBuffer = await adminPostRes.arrayBuffer();
  const u8 = new Uint8Array(rawBuffer);
  if (u8[0] !== 0xef || u8[1] !== 0xbb || u8[2] !== 0xbf) {
    throw new Error("Admin export missing UTF-8 BOM bytes (0xEF, 0xBB, 0xBF)");
  }
  console.log("✅ Verified raw byte stream begins with UTF-8 BOM: 0xEF, 0xBB, 0xBF");

  const csvText = new TextDecoder("utf-8").decode(rawBuffer);
  const lines = csvText.trim().split("\r\n");
  console.log(`Received ${lines.length} lines of CSV. Header: ${lines[0].substring(0, 40)}...`);
  if (lines.length !== 21) { // 1 header + 20 rows
    throw new Error(`Expected 21 lines, got ${lines.length}`);
  }
  console.log("✅ Admin successfully exported filtered page of orders.\n");

  // =========================================================================
  // TEST 2: Admin Can Export All Filtered Results via GET /api/export
  // =========================================================================
  console.log("--- Test 2: Admin Authorized Export (All Filtered GET) ---");
  const adminGetRes = await fetch(
    `${BASE_URL}/api/export?type=orders&status=Pending&scope=all`,
    {
      headers: { Cookie: adminCookie },
    }
  );

  console.log(`Admin GET /api/export -> HTTP Status: ${adminGetRes.status}`);
  if (adminGetRes.status !== 200) {
    throw new Error(`Expected HTTP 200 for Admin GET export, got ${adminGetRes.status}`);
  }
  const getText = await adminGetRes.text();
  const getLines = getText.trim().split("\r\n");
  console.log(`Pending orders exported: ${getLines.length - 1} rows.`);
  console.log("✅ Admin successfully exported all filtered pending orders via GET.\n");

  // =========================================================================
  // TEST 3: Viewer Is Strictly Forbidden from Exporting via POST
  // =========================================================================
  console.log("--- Test 3: Viewer Direct Attempt to Export via POST ---");
  const viewerPostRes = await fetch(`${BASE_URL}/api/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: viewerCookie,
    },
    body: JSON.stringify({ type: "orders" }),
  });

  console.log(`Viewer POST /api/export -> HTTP Status: ${viewerPostRes.status}`);
  if (viewerPostRes.status !== 403) {
    throw new Error(`Security Failure: Expected HTTP 403 Forbidden for Viewer, got ${viewerPostRes.status}`);
  }
  const viewerPostBody = await viewerPostRes.json();
  console.log("Viewer rejection response:", viewerPostBody);
  if (viewerPostBody.code !== "FORBIDDEN") {
    throw new Error(`Expected code FORBIDDEN, got: ${viewerPostBody.code}`);
  }
  console.log("✅ RESTRICTION VERIFIED: Server strictly rejected Viewer POST export request with HTTP 403.\n");

  // =========================================================================
  // TEST 4: Viewer Is Strictly Forbidden from Exporting via GET
  // =========================================================================
  console.log("--- Test 4: Viewer Direct Attempt to Export via GET ---");
  const viewerGetRes = await fetch(`${BASE_URL}/api/export?type=orders`, {
    headers: { Cookie: viewerCookie },
  });

  console.log(`Viewer GET /api/export -> HTTP Status: ${viewerGetRes.status}`);
  if (viewerGetRes.status !== 403) {
    throw new Error(`Security Failure: Expected HTTP 403 Forbidden for Viewer, got ${viewerGetRes.status}`);
  }
  const viewerGetBody = await viewerGetRes.json();
  console.log("Viewer GET rejection response:", viewerGetBody);
  console.log("✅ RESTRICTION VERIFIED: Server strictly rejected Viewer GET export request with HTTP 403.\n");

  // =========================================================================
  // TEST 5: Unauthenticated Request Blocked (HTTP 401)
  // =========================================================================
  console.log("--- Test 5: Unauthenticated Direct Export Attempt ---");
  const anonRes = await fetch(`${BASE_URL}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "orders" }),
  });

  console.log(`Unauthenticated POST /api/export -> HTTP Status: ${anonRes.status}`);
  if (anonRes.status !== 401) {
    throw new Error(`Security Failure: Expected HTTP 401 Unauthorized for unauthenticated export, got ${anonRes.status}`);
  }
  console.log("✅ RESTRICTION VERIFIED: Unauthenticated export strictly rejected with HTTP 401.\n");

  console.log("=======================================================================");
  console.log("🎉 ALL RBAC AUTHORIZATION & SECURITY TESTS PASSED WITH 100% SUCCESS!");
  console.log("=======================================================================\n");
}

runRBACTests().catch((err) => {
  console.error("❌ RBAC Test Failed:", err);
  process.exit(1);
});
