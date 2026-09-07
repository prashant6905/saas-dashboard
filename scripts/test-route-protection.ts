async function runRouteProtectionTests() {
  console.log("🛡️ Running Route Protection & Middleware Tests against http://localhost:3000...\n");

  const baseUrl = "http://localhost:3000";

  // 1. Test Public Routes (Unauthenticated should get 200 OK)
  const publicRoutes = ["/login", "/signup", "/forgot-password"];
  console.log("1. Testing Public Routes (Unauthenticated Access):");
  for (const route of publicRoutes) {
    const res = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    if (res.status === 200) {
      console.log(`✅ ${route} returned HTTP 200 OK (accessible).`);
    } else {
      console.error(`❌ Expected 200 for ${route}, got ${res.status}`);
      process.exit(1);
    }
  }

  // 2. Test Protected Routes (Unauthenticated should receive redirect to /login)
  const protectedRoutes = [
    "/dashboard",
    "/analytics",
    "/orders",
    "/products",
    "/customers",
    "/settings",
  ];

  console.log("\n2. Testing Protected Routes (Unauthenticated Interception):");
  for (const route of protectedRoutes) {
    const res = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    if ((res.status === 307 || res.status === 308 || res.status === 302) && location.includes("/login")) {
      console.log(`✅ ${route} intercepted with HTTP ${res.status} -> Redirected to: ${location}`);
    } else {
      console.error(`❌ Expected redirect to /login for ${route}, got status ${res.status} (location: ${location})`);
      process.exit(1);
    }
  }

  // 3. Test Authenticated Access (Using cc_auth_session cookie)
  console.log("\n3. Testing Authenticated Access to Protected Routes:");
  const testUser = {
    id: "usr_admin",
    email: "admin@commandcenter.io",
    name: "Alex Director",
    role: "Administrator",
  };
  const cookieHeader = `cc_auth_session=${encodeURIComponent(JSON.stringify(testUser))}`;

  for (const route of protectedRoutes) {
    const res = await fetch(`${baseUrl}${route}`, {
      headers: {
        Cookie: cookieHeader,
      },
      redirect: "manual",
    });

    if (res.status === 200) {
      console.log(`✅ Authenticated session granted access to ${route} (HTTP 200 OK).`);
    } else {
      console.error(`❌ Authenticated request to ${route} failed with status ${res.status}`);
      process.exit(1);
    }
  }

  // 4. Test Authenticated User Redirected from Auth Pages to Dashboard
  console.log("\n4. Testing Authenticated Redirection from Auth Pages (/login -> /dashboard):");
  const resAuthLogin = await fetch(`${baseUrl}/login`, {
    headers: {
      Cookie: cookieHeader,
    },
    redirect: "manual",
  });
  const authRedirect = resAuthLogin.headers.get("location") || "";
  if (
    (resAuthLogin.status === 307 || resAuthLogin.status === 308 || resAuthLogin.status === 302) &&
    authRedirect.includes("/dashboard")
  ) {
    console.log(`✅ Authenticated user accessing /login redirected to /dashboard (HTTP ${resAuthLogin.status}).`);
  } else {
    console.error(`❌ Expected redirect to /dashboard from /login, got ${resAuthLogin.status} (location: ${authRedirect})`);
    process.exit(1);
  }

  // 5. Root Route (/) Redirection
  console.log("\n5. Testing Root Route (/) Redirection:");
  const resRootUnauth = await fetch(`${baseUrl}/`, { redirect: "manual" });
  const rootLocationUnauth = resRootUnauth.headers.get("location") || "";
  if (rootLocationUnauth.includes("/login")) {
    console.log(`✅ Unauthenticated visit to / redirected to /login.`);
  } else {
    console.error(`❌ Expected / to redirect to /login, got: ${rootLocationUnauth}`);
    process.exit(1);
  }

  const resRootAuth = await fetch(`${baseUrl}/`, {
    headers: {
      Cookie: cookieHeader,
    },
    redirect: "manual",
  });
  const rootLocationAuth = resRootAuth.headers.get("location") || "";
  if (rootLocationAuth.includes("/dashboard")) {
    console.log(`✅ Authenticated visit to / redirected to /dashboard.`);
  } else {
    console.error(`❌ Expected / to redirect to /dashboard for authenticated user, got: ${rootLocationAuth}`);
    process.exit(1);
  }

  console.log("\n🎉 ALL ROUTE PROTECTION & MIDDLEWARE TESTS PASSED WITH 100% SUCCESS!");
}

runRouteProtectionTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
