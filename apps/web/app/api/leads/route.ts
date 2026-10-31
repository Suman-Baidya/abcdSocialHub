import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  service: string;
  campaign: string;
  status: "NEW" | "IN_PROGRESS" | "CONVERTED";
  receivedAt: string;
  notes?: string;
  estimatedValue?: number;
}

// In-memory tenant store seeded with high-converting Indian commerce leads
let TENANT_LEADS_STORE: Record<string, LeadItem[]> = {};

function getInitialLeads(): LeadItem[] {
  return [
    {
      id: "lead_01",
      name: "Ananya Mukherjee",
      phone: "+91 98301 23456",
      service: "Durga Puja Hair Spa & Color Combo",
      campaign: "Festive Early Bird 35% Off (Instagram)",
      status: "NEW",
      receivedAt: "Today, 10:14 AM IST",
      notes: "Asked about Saturday morning slot for 2 people.",
      estimatedValue: 2499,
    },
    {
      id: "lead_02",
      name: "Sourav Ganguly",
      phone: "+91 98312 98765",
      service: "Weekend Grooming Package",
      campaign: "Weekend Flash Sale (Facebook Page)",
      status: "IN_PROGRESS",
      receivedAt: "Today, 09:30 AM IST",
      notes: "Inquired about beard styling and facial pricing.",
      estimatedValue: 1499,
    },
    {
      id: "lead_03",
      name: "Pooja Sen",
      phone: "+91 98745 11223",
      service: "Bridal Glow Consultation",
      campaign: "Festive Early Bird (Instagram Reel)",
      status: "CONVERTED",
      receivedAt: "Yesterday, 04:15 PM IST",
      notes: "Advance ₹2,000 paid via UPI. Booking confirmed.",
      estimatedValue: 8500,
    },
    {
      id: "lead_04",
      name: "Debashis Roy",
      phone: "+91 90510 55443",
      service: "Keratin Treatment Consultation",
      campaign: "Durga Puja 35% Off Hair Spa",
      status: "NEW",
      receivedAt: "Yesterday, 02:45 PM IST",
      notes: "Requested price quote for shoulder length hair.",
      estimatedValue: 4500,
    },
    {
      id: "lead_05",
      name: "Megha Chakraborty",
      phone: "+91 98367 88990",
      service: "Botanical Hair Spa & Blow Dry",
      campaign: "WhatsApp VIP Pass Promotion",
      status: "CONVERTED",
      receivedAt: "28 Oct, 01:20 PM IST",
      notes: "Redeemed ₹300 VIP bonus voucher. Confirmed for Friday.",
      estimatedValue: 1800,
    },
    {
      id: "lead_06",
      name: "Subhashis Bose",
      phone: "+91 91634 77112",
      service: "Full Body Ayurvedic Massage",
      campaign: "Weekend Flash Sale (Facebook)",
      status: "IN_PROGRESS",
      receivedAt: "28 Oct, 11:05 AM IST",
      notes: "Wants 60-min session on Sunday afternoon.",
      estimatedValue: 2200,
    },
    {
      id: "lead_07",
      name: "Rituja Banik",
      phone: "+91 98319 33445",
      service: "Pre-Bridal Skin Radiance Facial",
      campaign: "Festive Glow Makeover Reel",
      status: "NEW",
      receivedAt: "27 Oct, 06:10 PM IST",
      notes: "Asking if organic gold facial is available.",
      estimatedValue: 3500,
    },
    {
      id: "lead_08",
      name: "Arindam Ghosh",
      phone: "+91 90071 99221",
      service: "Hair Cut & Charcoal Beard Spa",
      campaign: "Direct Walk-in / WhatsApp QR",
      status: "CONVERTED",
      receivedAt: "27 Oct, 03:40 PM IST",
      notes: "Finished service, enrolled in monthly membership.",
      estimatedValue: 1200,
    },
    {
      id: "lead_09",
      name: "Tanya Singhania",
      phone: "+91 98305 66778",
      service: "Gel Nail Art & Pedicure Combo",
      campaign: "Festive Early Bird (Instagram)",
      status: "IN_PROGRESS",
      receivedAt: "26 Oct, 05:15 PM IST",
      notes: "Sent French manicure sample pictures over WhatsApp.",
      estimatedValue: 1999,
    },
    {
      id: "lead_10",
      name: "Kunal Dasgupta",
      phone: "+91 98311 00223",
      service: "Anti-Dandruff Scalp Treatment",
      campaign: "Video Reel Hook Promotion",
      status: "NEW",
      receivedAt: "26 Oct, 11:30 AM IST",
      notes: "Interested in 3-session package plan.",
      estimatedValue: 3200,
    },
    {
      id: "lead_11",
      name: "Shrabanti Dutta",
      phone: "+91 98741 44556",
      service: "Bridal Makeup Trial & Draping",
      campaign: "Festive Glow Makeover (LinkedIn)",
      status: "CONVERTED",
      receivedAt: "25 Oct, 04:50 PM IST",
      notes: "Wedding date 18th December. Trial confirmed.",
      estimatedValue: 12000,
    },
    {
      id: "lead_12",
      name: "Vikramaditya Roy",
      phone: "+91 90514 88221",
      service: "Luxury Hair Spa & Head Massage",
      campaign: "Weekend Flash Sale (Facebook)",
      status: "NEW",
      receivedAt: "25 Oct, 01:10 PM IST",
      notes: "Follow up on Friday evening.",
      estimatedValue: 1600,
    },
  ];
}

const createLeadSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(8, "Phone number is required"),
  service: z.string().min(2, "Service is required"),
  campaign: z.string().optional().default("Direct Inbound / WhatsApp QR"),
  notes: z.string().optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "CONVERTED"]).default("NEW"),
  estimatedValue: z.number().optional().default(1500),
});

const updateLeadSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  status: z.enum(["NEW", "IN_PROGRESS", "CONVERTED"]).optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const role = user?.role;
    const allowedPages: string[] = user?.allowedPages || [];

    // Role check: Creators and Guests are barred from customer CRM leads
    if (
      role === "CREATOR" ||
      role === "GUEST" ||
      ((role === "ADMIN_STAFF" || role === "STAFF") && allowedPages.length > 0 && !allowedPages.includes("leads"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to access CRM leads" },
        { status: 403 }
      );
    }

    const workspaceId = user?.workspaceId || "ws_demo_default";

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!TENANT_LEADS_STORE[workspaceId]) {
      TENANT_LEADS_STORE[workspaceId] = getInitialLeads();
    }

    const allLeads = TENANT_LEADS_STORE[workspaceId];
    const { searchParams } = new URL(req.url);

    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
    const statusFilter = (searchParams.get("status") || "ALL").toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

    // Apply Filter & Search
    let filtered = allLeads.filter((lead) => {
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        lead.name.toLowerCase().includes(searchQuery) ||
        lead.phone.includes(searchQuery) ||
        lead.service.toLowerCase().includes(searchQuery) ||
        lead.campaign.toLowerCase().includes(searchQuery) ||
        (lead.notes && lead.notes.toLowerCase().includes(searchQuery));

      return matchesStatus && matchesSearch;
    });

    // Compute Overall Summary Stats (Over entire workspace leads dataset)
    const totalCount = allLeads.length;
    const newCount = allLeads.filter((l) => l.status === "NEW").length;
    const inProgressCount = allLeads.filter((l) => l.status === "IN_PROGRESS").length;
    const convertedCount = allLeads.filter((l) => l.status === "CONVERTED").length;
    const conversionRate = totalCount > 0 ? Math.round((convertedCount / totalCount) * 100) : 0;
    const estimatedPipelineValue = allLeads.reduce(
      (sum, l) => sum + (l.estimatedValue || 1500),
      0
    );

    // Apply Pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      items: paginatedItems,
      pagination: {
        page,
        limit,
        totalItems: totalFiltered,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      stats: {
        totalCount,
        newCount,
        inProgressCount,
        convertedCount,
        conversionRate,
        estimatedPipelineValue,
      },
    });
  } catch (error: any) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId || "ws_demo_default";

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid lead data" },
        { status: 400 }
      );
    }

    if (!TENANT_LEADS_STORE[workspaceId]) {
      TENANT_LEADS_STORE[workspaceId] = getInitialLeads();
    }

    const newLead: LeadItem = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: parsed.data.name,
      phone: parsed.data.phone,
      service: parsed.data.service,
      campaign: parsed.data.campaign || "Direct Inbound / WhatsApp QR",
      status: parsed.data.status,
      receivedAt: "Just now",
      notes: parsed.data.notes || "",
      estimatedValue: parsed.data.estimatedValue || 1500,
    };

    TENANT_LEADS_STORE[workspaceId].unshift(newLead);

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId || "ws_demo_default";

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    if (!TENANT_LEADS_STORE[workspaceId]) {
      TENANT_LEADS_STORE[workspaceId] = getInitialLeads();
    }

    const leads = TENANT_LEADS_STORE[workspaceId];
    const index = leads.findIndex((l) => l.id === parsed.data.id);

    if (index === -1) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (parsed.data.status) {
      leads[index].status = parsed.data.status;
    }
    if (parsed.data.notes !== undefined) {
      leads[index].notes = parsed.data.notes;
    }

    return NextResponse.json({ success: true, lead: leads[index] });
  } catch (error: any) {
    console.error("PATCH /api/leads error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

