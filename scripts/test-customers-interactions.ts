async function runInteractionTests() {
  console.log("🌐 Starting Customers Server Interaction Tests against http://localhost:3000...\n");

  const baseUrl = "http://localhost:3000";

  // Test 1: Customers directory index
  console.log("1. Testing GET /customers...");
  const resIndex = await fetch(`${baseUrl}/customers`);
  if (resIndex.status === 200) {
    const html = await resIndex.text();
    if (
      html.includes("Customers") &&
      html.includes("Buyer profiles") &&
      html.includes("Total Profiles") &&
      html.includes("VIP Accounts")
    ) {
      console.log("✅ GET /customers returned 200 and rendered directory header and KPI cards.");
    } else {
      console.error("❌ GET /customers response missing expected text content.");
      process.exit(1);
    }
  } else {
    console.error(`❌ GET /customers failed with status ${resIndex.status}`);
    process.exit(1);
  }

  // Test 2: Search filter
  console.log("\n2. Testing GET /customers?search=Emily...");
  const resSearch = await fetch(`${baseUrl}/customers?search=Emily`);
  if (resSearch.status === 200) {
    const html = await resSearch.text();
    console.log("✅ GET /customers?search=Emily returned 200 OK.");
  } else {
    console.error(`❌ Search test failed with status ${resSearch.status}`);
    process.exit(1);
  }

  // Test 3: Segment & Region filter
  console.log("\n3. Testing GET /customers?region=Europe&segment=VIP...");
  const resFilter = await fetch(`${baseUrl}/customers?region=Europe&segment=VIP`);
  if (resFilter.status === 200) {
    const html = await resFilter.text();
    console.log("✅ GET /customers?region=Europe&segment=VIP returned 200 OK.");
  } else {
    console.error(`❌ Filter test failed with status ${resFilter.status}`);
    process.exit(1);
  }

  // Test 4: Detail page for valid customer cust_0001
  console.log("\n4. Testing GET /customers/cust_0001...");
  const resDetail = await fetch(`${baseUrl}/customers/cust_0001`);
  if (resDetail.status === 200) {
    const html = await resDetail.text();
    if (
      html.includes("Emily Brown") &&
      html.includes("cust_0001") &&
      html.includes("Purchase History") &&
      html.includes("Recent Orders Placed")
    ) {
      console.log("✅ Customer detail view rendered Emily Brown profile, purchase history, and recent orders.");
    } else {
      console.error("❌ Customer detail missing expected sections in HTML output.");
      process.exit(1);
    }
  } else {
    console.error(`❌ GET /customers/cust_0001 failed with status ${resDetail.status}`);
    process.exit(1);
  }

  // Test 5: Detail page for invalid customer ID
  console.log("\n5. Testing GET /customers/cust_invalid_9999...");
  const resInvalid = await fetch(`${baseUrl}/customers/cust_invalid_9999`);
  if (resInvalid.status === 200) {
    const html = await resInvalid.text();
    if (html.includes("Customer Not Found") && html.includes("cust_invalid_9999")) {
      console.log("✅ CustomerNotFound fallback rendered with recovery link to /customers.");
    } else {
      console.error("❌ CustomerNotFound component not detected in invalid ID response.");
      process.exit(1);
    }
  } else {
    console.error(`❌ Unexpected status for invalid ID: ${resInvalid.status}`);
    process.exit(1);
  }

  console.log("\n🎉 ALL CUSTOMERS INTERACTION TESTS PASSED SUCCESSFULLY!");
}

runInteractionTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
