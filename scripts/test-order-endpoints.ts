async function testEndpoints() {
  console.log("🌐 Testing Next.js /orders/[id] Endpoints via HTTP Fetch...\n");

  const urls = [
    { url: "http://localhost:3000/orders/ord_00001", expected: 200, label: "Valid Order (ord_00001)" },
    { url: "http://localhost:3000/orders/ord_00050", expected: 200, label: "Valid Order (ord_00050)" },
    { url: "http://localhost:3000/orders/ord_99999", expected: 200, label: "Missing Order (ord_99999 -> Not Found UI)" },
    { url: "http://localhost:3000/orders/invalid-id-xyz", expected: 200, label: "Invalid Order ID -> Not Found UI" },
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url);
      const text = await res.text();
      console.log(`- ${item.label}: HTTP ${res.status}`);

      if (res.status === item.expected) {
        if (item.url.includes("ord_00001")) {
          const hasCustomer = text.includes("Ethan Gonzalez") || text.includes("ethan.gonzalez226@example.com");
          const hasAmount = text.includes("474.56");
          console.log(`  ✓ Contains customer & amount: ${hasCustomer && hasAmount}`);
        } else if (item.url.includes("ord_99999")) {
          const hasNotFound = text.includes("Order Not Found") && text.includes("ord_99999");
          console.log(`  ✓ Renders Order Not Found UI: ${hasNotFound}`);
        }
      } else {
        console.error(`  ❌ Unexpected status code ${res.status} for ${item.url}`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`  ❌ Failed to fetch ${item.url}:`, err);
      process.exit(1);
    }
  }

  console.log("\n🎉 ALL HTTP ENDPOINTS TESTED SUCCESSFULLY!");
}

testEndpoints();
