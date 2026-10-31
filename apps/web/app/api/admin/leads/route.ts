import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface LeadItem {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  address: string;
  rating: string;
  status: "NEW" | "PITCHED" | "CONVERTED";
  suggestedPitch: {
    bn: string;
    en: string;
  };
}

const ALL_PROSPECTS: LeadItem[] = [
  // Kolkata / Salons
  {
    id: "lead_kol_1",
    name: "Glamour Looks Unisex Salon",
    category: "salon",
    city: "Kolkata",
    phone: "+91 98301 23456",
    address: "Park Street, Near Camac Street, Kolkata",
    rating: "4.8",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Glamour Looks! আমরা আপনার সেলুনের জন্য AI দিয়ে একটি সুন্দর ১০৮০×১০৮০ ব্র্যাণ্ডেড পোস্টার ডিজাইন করেছি। সম্পূর্ণ বিনামূল্যে দেখতে ও আপনার ফেসবুক/হোয়াটসঅ্যাপে শেয়ার করতে নিচের লিঙ্কে ক্লিক করুন: https://abcdsocial.com/demo`,
      en: `Hello Glamour Looks! We noticed your salon on Park Street and generated a branded 1080×1080 promotional poster for you using AI. Tap here to view your free demo: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_kol_2",
    name: "Aura Beauty Lounge & Spa",
    category: "salon",
    city: "Kolkata",
    phone: "+91 98302 34567",
    address: "Gariahat Crossing, South Kolkata",
    rating: "4.7",
    status: "PITCHED",
    suggestedPitch: {
      bn: `নমস্কার Aura Beauty Lounge! পূজার বিশেষ হেয়ার স্পা অফারের জন্য আমরা একটি আকর্ষণীয় সোশ্যাল মিডিয়া ক্রিয়েটিভ তৈরি করেছি। দেখতে ট্যাপ করুন: https://abcdsocial.com/demo`,
      en: `Hello Aura Beauty! Check out this high-converting festival promo graphic created specifically for your hair spa services: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_kol_3",
    name: "Style Studio Hair & Beard",
    category: "salon",
    city: "Kolkata",
    phone: "+91 98303 45678",
    address: "Behala Chowrasta, Kolkata",
    rating: "4.6",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Style Studio! আপনার সেলুনের নতুন অফারগুলো কাস্টমারদের কাছে পৌঁছে দিতে এই অটোমেটেড পোস্টারটি চেক করুন: https://abcdsocial.com/demo`,
      en: `Hi Style Studio! Enhance your local reach in Behala with automated promotional creatives: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_kol_4",
    name: "Senses Herbal Parlour",
    category: "salon",
    city: "Kolkata",
    phone: "+91 98304 56789",
    address: "Shyambazar Five-Point, North Kolkata",
    rating: "4.9",
    status: "CONVERTED",
    suggestedPitch: {
      bn: `নমস্কার Senses Herbal! প্রাকৃতিক স্কিনকেয়ার ও ভেষজ ফেসিয়ালের জন্য রেডি পোস্টারটি দেখুন: https://abcdsocial.com/demo`,
      en: `Hello Senses Herbal! Here is an AI-crafted marketing banner for your organic skincare packages: https://abcdsocial.com/demo`,
    },
  },

  // Dental Clinics
  {
    id: "lead_dent_1",
    name: "Smile Care Dental Clinic",
    category: "dentist",
    city: "Kolkata",
    phone: "+91 98312 98765",
    address: "Salt Lake Sector 1, Block BD, Kolkata",
    rating: "4.9",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Smile Care Dental! আপনাদের ক্লিনিকে নতুন পেশেন্ট বাড়াতে আমরা একটি ডিজিটাল পোস্টার ড্রাফট করেছি। ১-ট্যাপে চেক করতে দেখুন: https://abcdsocial.com/demo`,
      en: `Hi Dr. Smile Care Dental! We created a complimentary social poster for dental checkups in Salt Lake. View your demo here: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_dent_2",
    name: "Apex Advanced Oral Care",
    category: "dentist",
    city: "Kolkata",
    phone: "+91 98315 87654",
    address: "Ballygunge Circular Road, Kolkata",
    rating: "4.8",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Apex Dental! রুট ক্যানাল ও অর্থোডন্টিক্স কনসাল্টেশনের জন্য সুন্দর প্রচার ব্যানারটি দেখুন: https://abcdsocial.com/demo`,
      en: `Hello Dr. Apex Oral Care! Here is a branded patient outreach banner ready for your WhatsApp status: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_dent_3",
    name: "Perfect Teeth Multispeciality",
    category: "dentist",
    city: "Salt Lake",
    phone: "+91 98316 76543",
    address: "City Centre 1 Area, Salt Lake, Kolkata",
    rating: "4.7",
    status: "PITCHED",
    suggestedPitch: {
      bn: `নমস্কার Perfect Teeth! ডেন্টাল ইমপ্ল্যান্ট ও স্মাইল মেকওভারের ডিজিটাল পোস্টারটি ফ্রি দেখে নিন: https://abcdsocial.com/demo`,
      en: `Hi Perfect Teeth Clinic! Check out this high-converting dental implant awareness creative: https://abcdsocial.com/demo`,
    },
  },

  // Fitness Gyms
  {
    id: "lead_gym_1",
    name: "Iron Core Fitness Gym",
    category: "gym",
    city: "Kolkata",
    phone: "+91 98745 65432",
    address: "Gariahat Main Road, South Kolkata",
    rating: "4.7",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Iron Core Fitness! জিমের নতুন মেম্বারশিপ ড্রাইভের জন্য আমাদের তৈরি বাংলা ও ইংলিশ পোস্টারটি দেখুন: https://abcdsocial.com/demo`,
      en: `Hey Iron Core Fitness team! Check out this high-converting membership promo graphic we generated for you: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_gym_2",
    name: "Pulse 360 Crossfit Studio",
    category: "gym",
    city: "Salt Lake",
    phone: "+91 98746 54321",
    address: "Sector 5, Webel More Area, Salt Lake",
    rating: "4.8",
    status: "PITCHED",
    suggestedPitch: {
      bn: `নমস্কার Pulse 360! আইটি পেশাদারদের জন্য স্পেশাল উইকএন্ড ফিটনেস প্যাকেজের পোস্টারটি চেক করুন: https://abcdsocial.com/demo`,
      en: `Hello Pulse 360! Promote your weekend CrossFit batches to Sector 5 corporate professionals: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_gym_3",
    name: "Titan Strength & Conditioning",
    category: "gym",
    city: "Howrah",
    phone: "+91 98747 43210",
    address: "Mandirtala, Nabanna Zone, Howrah",
    rating: "4.6",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Titan Strength! পার্সোনাল ট্রেইনিং ও ওয়েট লস ক্যাম্পেইনের সোশ্যাল ব্যানার দেখুন: https://abcdsocial.com/demo`,
      en: `Hey Titan Gym! Check out your new seasonal weight-loss transformation poster: https://abcdsocial.com/demo`,
    },
  },

  // Auto Repair & Garages
  {
    id: "lead_auto_1",
    name: "Apex Auto Care & Garage",
    category: "auto",
    city: "Howrah",
    phone: "+91 98366 11223",
    address: "Howrah AC Market Area, Howrah",
    rating: "4.6",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Apex Auto Care! পুজো ও উৎসবের কার সার্ভিসিং অফার প্রোমোট করতে এই সোশ্যাল পোস্টারটি দেখুন: https://abcdsocial.com/demo`,
      en: `Hello Apex Auto Care! Here is a free car service promo banner ready for your WhatsApp status: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_auto_2",
    name: "Speedy Wheel Alignment & Wash",
    category: "auto",
    city: "Kolkata",
    phone: "+91 98367 22334",
    address: "EM Bypass near Ruby Hospital, Kolkata",
    rating: "4.8",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Speedy Wheel! মনসুন কার চেকআপ ও সিরামিক কোটিং অফার পোস্টারটি ১-ট্যাপে দেখুন: https://abcdsocial.com/demo`,
      en: `Hello Speedy Wheel! Boost local car detailing bookings on EM Bypass with this promo banner: https://abcdsocial.com/demo`,
    },
  },

  // Coaching & Tutors
  {
    id: "lead_tutor_1",
    name: "Bright Future Coaching Institute",
    category: "tutor",
    city: "Kolkata",
    phone: "+91 98309 88776",
    address: "Jadavpur Central Road, Kolkata",
    rating: "4.9",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Bright Future Institute! নতুন ব্যাচের অ্যাডমিশনের জন্য এই হাই-কোয়ালিটি পোস্টারটি চেক করুন: https://abcdsocial.com/demo`,
      en: `Hello Bright Future Institute! We generated this student enrollment social banner for your coaching centre: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_tutor_2",
    name: "Apex IIT-JEE & NEET Academy",
    category: "tutor",
    city: "Kolkata",
    phone: "+91 98310 99887",
    address: "College Street / Bowbazar, Kolkata",
    rating: "4.9",
    status: "PITCHED",
    suggestedPitch: {
      bn: `নমস্কার Apex Academy! আগামী বছরের ক্র্যাশ কোর্সের জন্য ডিজিটাল অ্যাডমিশন ব্যানারটি দেখুন: https://abcdsocial.com/demo`,
      en: `Hello Apex Academy! Check out your new scholarship test campaign banner: https://abcdsocial.com/demo`,
    },
  },
  {
    id: "lead_tutor_3",
    name: "Target Commerce Classes",
    category: "tutor",
    city: "Salt Lake",
    phone: "+91 98311 00998",
    address: "Sector 2, Near Karunamoyee, Salt Lake",
    rating: "4.7",
    status: "NEW",
    suggestedPitch: {
      bn: `নমস্কার Target Classes! ক্লাস ১১ ও ১২ কমার্স ব্যাচের স্টুডেন্টদের জন্য এই পোস্টারটি দেখুন: https://abcdsocial.com/demo`,
      en: `Hi Target Commerce! Announce your new batch admissions with this sharp visual creative: https://abcdsocial.com/demo`,
    },
  },
];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const isDeveloper =
      user?.isDeveloper ||
      user?.role === "DEVELOPER" ||
      user?.email === "suman.baidya.pro@gmail.com";

    const isSuperAdmin =
      isDeveloper ||
      user?.isSuperAdmin ||
      user?.role === "SUPER_ADMIN" ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Kolkata";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "5", 10)));

    // Filter leads
    let filtered = ALL_PROSPECTS;

    if (city && city !== "all") {
      filtered = filtered.filter((l) => l.city.toLowerCase() === city.toLowerCase());
    }

    if (category && category !== "all") {
      filtered = filtered.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== "all") {
      filtered = filtered.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.address.toLowerCase().includes(search) ||
          l.phone.includes(search)
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedLeads = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      city,
      category,
      page,
      limit,
      total,
      totalPages,
      count: paginatedLeads.length,
      leads: paginatedLeads,
    });
  } catch (error: any) {
    console.error("Admin leads API error:", error);
    return NextResponse.json({ error: "Failed to fetch leads", details: error.message }, { status: 500 });
  }
}
