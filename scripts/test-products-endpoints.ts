async function testProductsEndpoints() {
  console.log("🌐 Testing Next.js Products Catalog and Detail Endpoints via HTTP Fetch...\n");

  const baseUrl = "http://localhost:3000";

  const tests = [
    {
      url: `${baseUrl}/products`,
      label: "Products Catalog Page (/products)",
      validate: (html: string) => html.includes("Products") && html.includes("Active SKUs"),
    },
    {
      url: `${baseUrl}/products?search=wireless&category=cat_01&stock=Low+Stock`,
      label: "Filtered Products Catalog (?search=wireless&category=cat_01)",
      validate: (html: string) => html.includes("Products"),
    },
    {
      url: `${baseUrl}/products/prod_0001`,
      label: "Product Detail: Studio Pro Wireless Headphones (/products/prod_0001)",
      validate: (html: string) =>
        html.includes("Studio Pro Wireless Headphones") &&
        html.includes("prod_0001") &&
        html.includes("Sales Velocity") &&
        html.includes("Recent Orders Containing SKU"),
    },
    {
      url: `${baseUrl}/products/prod_0026`,
      label: "Product Detail: Out of Stock SKU (/products/prod_0026)",
      validate: (html: string) =>
        html.includes("prod_0026") &&
        html.includes("Out of Stock"),
    },
    {
      url: `${baseUrl}/products/prod_9999`,
      label: "Missing Product SKU (/products/prod_9999 -> Product Not Found UI)",
      validate: (html: string) =>
        html.includes("Product Not Found") &&
        html.includes("prod_9999") &&
        html.includes("Return to Products"),
    },
    {
      url: `${baseUrl}/products/invalid-sku-random`,
      label: "Invalid SKU (/products/invalid-sku-random -> Product Not Found UI)",
      validate: (html: string) =>
        html.includes("Product Not Found") &&
        html.includes("Return to Products"),
    },
  ];

  for (const test of tests) {
    try {
      const res = await fetch(test.url);
      const text = await res.text();
      const status = res.status;
      const isValid = test.validate(text);

      console.log(`- ${test.label}: HTTP ${status}`);
      console.log(`  ✓ Content assertions passed: ${isValid}`);

      if (status !== 200 || !isValid) {
        console.error(`❌ Validation failed for ${test.url}`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`❌ Fetch error for ${test.url}:`, err);
      process.exit(1);
    }
  }

  console.log("\n🎉 ALL PRODUCT HTTP ENDPOINTS AND DETAIL VIEWS VERIFIED SUCCESSFULLY!");
}

testProductsEndpoints();
