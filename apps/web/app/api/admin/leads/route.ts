import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const isSuperAdmin =
      user?.isSuperAdmin ||
      user?.role === "SUPER_ADMIN" ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Kolkata";
    const category = searchParams.get("category") || "salon";

    // Curated high-converting prospect dataset for instant zero-latency demo
    const defaultLeads = [
      {
        id: "lead_1",
        name: "Glamour Looks Unisex Salon",
        category: "Hair & Beauty Salon",
        phone: "+91 98301 23456",
        address: "Park Street, Near Camac Street, Kolkata",
        rating: "4.8",
        suggestedPitch: {
          bn: `নমস্কার Glamour Looks! আমরা আপনার সেলুনের জন্য AI দিয়ে একটি সুন্দর ১০৮০×১০৮০ ব্র্যাণ্ডেড পোস্টার ডিজাইন করেছি। সম্পূর্ণ বিনামূল্যে দেখতে ও আপনার ফেসবুক/হোয়াটসঅ্যাপে শেয়ার করতে নিচের লিঙ্কে ক্লিক করুন: https://abcdsocial.com/demo`,
          en: `Hello Glamour Looks! We noticed your salon on Park Street and generated a branded 1080×1080 promotional poster for you using AI. Tap here to view your free demo: https://abcdsocial.com/demo`,
        },
      },
      {
        id: "lead_2",
        name: "Smile Care Dental Clinic",
        category: "Dental Clinic",
        phone: "+91 98312 98765",
        address: "Salt Lake Sector 1, Block BD, Kolkata",
        rating: "4.9",
        suggestedPitch: {
          bn: `নমস্কার Smile Care Dental! আপনাদের ক্লিনিকে নতুন পেশেন্ট বাড়াতে আমরা একটি ডিজিটাল পোস্টার ড্রাফট করেছি। ১-ট্যাপে চেক করতে দেখুন: https://abcdsocial.com/demo`,
          en: `Hi Dr. Smile Care Dental! We created a complimentary social poster for dental checkups in Salt Lake. View your demo here: https://abcdsocial.com/demo`,
        },
      },
      {
        id: "lead_3",
        name: "Iron Core Fitness Gym",
        category: "Fitness & Gym",
        phone: "+91 98745 65432",
        address: "Gariahat Main Road, South Kolkata",
        rating: "4.7",
        suggestedPitch: {
          bn: `নমস্কার Iron Core Fitness! জিমের নতুন মেম্বারশিপ ড্রাইভের জন্য আমাদের তৈরি বাংলা ও ইংলিশ পোস্টারটি দেখুন: https://abcdsocial.com/demo`,
          en: `Hey Iron Core Fitness team! Check out this high-converting membership promo graphic we generated for you: https://abcdsocial.com/demo`,
        },
      },
      {
        id: "lead_4",
        name: "Apex Auto Care & Garage",
        category: "Auto Repair",
        phone: "+91 98366 11223",
        address: "Howrah AC Market Area, Howrah",
        rating: "4.6",
        suggestedPitch: {
          bn: `নমস্কার Apex Auto Care! পুজো ও উৎসবের কার সার্ভিসিং অফার প্রোমোট করতে এই সোশ্যাল পোস্টারটি দেখুন: https://abcdsocial.com/demo`,
          en: `Hello Apex Auto Care! Here is a free car service promo banner ready for your WhatsApp status: https://abcdsocial.com/demo`,
        },
      },
      {
        id: "lead_5",
        name: "Bright Future Coaching Institute",
        category: "Tuition & Coaching",
        phone: "+91 98309 88776",
        address: "Jadavpur Central Road, Kolkata",
        rating: "4.9",
        suggestedPitch: {
          bn: `নমস্কার Bright Future Institute! নতুন ব্যাচের অ্যাডমিশনের জন্য এই হাই-কোয়ালিটি পোস্টারটি চেক করুন: https://abcdsocial.com/demo`,
          en: `Hello Bright Future Institute! We generated this student enrollment social banner for your coaching centre: https://abcdsocial.com/demo`,
        },
      },
    ];

    return NextResponse.json({
      success: true,
      city,
      category,
      count: defaultLeads.length,
      leads: defaultLeads,
    });
  } catch (error: any) {
    console.error("Admin leads API error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
