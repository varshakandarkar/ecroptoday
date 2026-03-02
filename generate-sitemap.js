import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Required for ES modules
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import dotenv from "dotenv";
import { SitemapStream, streamToPromise } from "sitemap";

// Load environment variables
dotenv.config();

// Your domain
const DOMAIN = "https://ecroptoday.co.in";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Debugging: Check if Firebase is Connected
console.log("🔗 Firebase Project ID:", process.env.REACT_APP_FIREBASE_PROJECT_ID);

// ✅ Fetch blogs with `categoryId: "ecrop"`
const fetchBlogSlugs = async () => {
  try {
    console.log("🔍 Fetching blogs with categoryId: 'e-CROPTODAY'...");

    // 🔥 Try different cases of `categoryId`
    const q = query(collection(db, "posts"), where("categoryId", "==", "e-CROPTODAY"));
    const querySnapshot = await getDocs(q);

    // Debugging: Log each blog document found
    let count = 0;
    querySnapshot.forEach((doc) => {
      console.log(`📄 Blog ${++count}:`, doc.data()); // Log full blog data
    });

    const slugs = querySnapshot.docs
      .map((doc) => doc.data().slug)
      .filter(Boolean); // Remove undefined slugs

    console.log("🔥 Total Blogs Found:", slugs.length);
    console.log("✅ Fetched Slugs:", slugs);
    return slugs;
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    return [];
  }
};

// ✅ Generate the sitemap
const generateSitemap = async () => {
  console.log("🚀 Generating sitemap...");

  // Fetch dynamic blog slugs (Filtered by category)
  const blogSlugs = await fetchBlogSlugs();

 const staticRoutes = ["/", "/about", "/archive","/editorial","/e-journal","/e-magazine","/publication","/guideline","/submission","/contact", "/blogs"];

  // Combine static and dynamic routes
  const allRoutes = [
    ...staticRoutes.map((route) => ({ url: route, changefreq: "daily", priority: 0.8 })),
    ...blogSlugs.map((slug) => ({ url: `/post/${slug}`, changefreq: "daily", priority: 0.7 })),
  ];

  // Create sitemap stream
  const sitemapStream = new SitemapStream({ hostname: DOMAIN });

  // Ensure the 'public' folder exists
  const publicDir = path.join(__dirname, "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // Create and write to sitemap.xml
  const sitemapPath = path.join(publicDir, "sitemap.xml");
  const writeStream = fs.createWriteStream(sitemapPath);
  sitemapStream.pipe(writeStream);

  // Add URLs to the sitemap
  allRoutes.forEach((route) => sitemapStream.write(route));
  sitemapStream.end();

  // Finalize sitemap writing
  await streamToPromise(sitemapStream);
  console.log("✅ Sitemap generated successfully:", sitemapPath);

  // Update sitemap_index.xml
  updateSitemapIndex();
};

// ✅ Update `sitemap_index.xml`
const updateSitemapIndex = () => {
  console.log("🔄 Updating sitemap_index.xml...");

  const sitemapPath = path.join(__dirname, "public", "sitemap.xml");
  const sitemapIndexPath = path.join(__dirname, "public", "sitemap_index.xml");

  if (!fs.existsSync(sitemapPath)) {
    console.error("❌ sitemap.xml missing! Index update failed.");
    return;
  }

  const lastModified = new Date(fs.statSync(sitemapPath).mtime).toISOString();

  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap.xml</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(sitemapIndexPath, sitemapIndexContent, "utf8");
  console.log("✅ sitemap_index.xml updated successfully:", sitemapIndexPath);
};

// ✅ Run sitemap generation
generateSitemap();
