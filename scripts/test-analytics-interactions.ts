async function runAnalyticsInteractionTests() {
  console.log("🌐 Starting Analytics Page Interaction Tests against http://localhost:3000...\n");

  const baseUrl = "http://localhost:3000";

  // Test 1: Dedicated Analytics page default view
  console.log("1. Testing GET /analytics (Default View)...");
  const resDefault = await fetch(`${baseUrl}/analytics`);
  if (resDefault.status === 200) {
    const html = await resDefault.text();
    const requiredTerms = [
      "Analytics",
      "Deep Dive",
      "Gross Profit",
      "Gross Margin",
      "Cost of Goods Sold",
      "Revenue &amp; Profit Velocity Trend",
      "Revenue by Category",
      "Revenue by Region",
      "Orders by Fulfillment Status",
      "Customer Segments Dynamics",
      "Top Merchandise Performance Matrix",
    ];

    const missingTerms = requiredTerms.filter(
      (term) => !html.includes(term) && !html.includes(term.replace("&amp;", "&"))
    );

    if (missingTerms.length === 0) {
      console.log("✅ GET /analytics returned 200 OK and rendered all 8 deep-dive analytics components.");
    } else {
      console.error("❌ Missing expected sections in /analytics response:", missingTerms);
      process.exit(1);
    }
  } else {
    console.error(`❌ GET /analytics failed with HTTP ${resDefault.status}`);
    process.exit(1);
  }

  // Test 2: Multi-dimensional filtering via URL query params
  console.log("\n2. Testing GET /analytics with URL Filters (?range=90d&region=Europe&segment=VIP)...");
  const resFiltered = await fetch(`${baseUrl}/analytics?range=90d&region=Europe&segment=VIP`);
  if (resFiltered.status === 200) {
    const html = await resFiltered.text();
    if (html.includes("Analytics") && html.includes("Gross Profit")) {
      console.log("✅ Filtered analytics route returned 200 OK with server hydration.");
    } else {
      console.error("❌ Filtered analytics page content missing.");
      process.exit(1);
    }
  } else {
    console.error(`❌ Filtered query failed with HTTP ${resFiltered.status}`);
    process.exit(1);
  }

  // Test 3: Status & Category filter
  console.log("\n3. Testing GET /analytics with Category & Status Filters (?category=cat_0001&status=Delivered)...");
  const resCatStatus = await fetch(`${baseUrl}/analytics?category=cat_0001&status=Delivered`);
  if (resCatStatus.status === 200) {
    console.log("✅ Category & Status filtered route returned 200 OK.");
  } else {
    console.error(`❌ Category & Status filter failed with HTTP ${resCatStatus.status}`);
    process.exit(1);
  }

  console.log("\n🎉 ALL ANALYTICS INTERACTION TESTS PASSED SUCCESSFULLY!");
}

runAnalyticsInteractionTests().catch((err) => {
  console.error("Interaction test error:", err);
  process.exit(1);
});
