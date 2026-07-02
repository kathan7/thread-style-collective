const pool = require("./db");
const bcrypt = require("bcryptjs");

const seedDB = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Seeding database...");

    // Admin user only — customers register via the app
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash("admin123", salt);

    await client.query(
      "INSERT INTO users (email, password_hash, full_name, phone, role, email_verified) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING",
      ["admin@threadmarket.com", adminPass, "Admin User", null, "admin", true]
    );
    console.log("  ✓ Admin user seeded");

    // Categories for product organization
    const cats = [
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Hoodies", slug: "hoodies" },
      { name: "Pants", slug: "pants" },
      { name: "Dresses", slug: "dresses" },
      { name: "Outerwear", slug: "outerwear" },
      { name: "Accessories", slug: "accessories" },
    ];

    for (const cat of cats) {
      await client.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
        [cat.name, cat.slug]
      );
    }
    console.log("  ✓ Categories seeded");

    await client.query("COMMIT");
    console.log("\n✅ Database seeded successfully!");
    console.log("\n📧 Admin Login: admin@threadmarket.com / admin123");
    console.log("👤 Customers: create an account via /auth\n");
    console.log("ℹ️  Add products with stock via the Admin Panel → Products\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding database:", err);
  } finally {
    client.release();
  }
};

seedDB().then(() => process.exit(0)).catch(() => process.exit(1));
