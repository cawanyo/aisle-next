import type { Milestone } from "@/types/milestone";

export const milestones: Milestone[] = [
  {
    id: 1,
    title: "Define the Budget",
    type: "essential",
    phase: "Setting the Coordinates",
    description: "Determine total spend and contributions from both families.",
    icon: "💰",
    tips: [
      "Be realistic about what you can afford",
      "Include a 10-15% buffer for unexpected costs",
      "Discuss contributions with family early"
    ],
    isCompleted: false
  },
  {
    id: 2,
    title: "The Guest List Draft",
    type: "essential",
    phase: "Setting the Coordinates",
    description: "Estimated headcount that determines venue size and catering needs.",
    icon: "📝",
    tips: [
      "Start with must-have guests",
      "Consider venue capacity",
      "Remember each guest impacts multiple costs"
    ],
    isCompleted: false
  },
  {
    id: 3,
    title: "Pick a Date/Season",
    type: "essential",
    phase: "Setting the Coordinates",
    description: "Narrow down to a month or specific weekend for your celebration.",
    icon: "📅",
    tips: [
      "Check availability of key guests",
      "Consider weather and season",
      "Weekday weddings can save money"
    ], isCompleted: false
  },
  {
    id: 4,
    title: "Engagement Party",
    type: "optional",
    phase: "Setting the Coordinates",
    description: "Book a venue or bar for an engagement celebration.",
    icon: "🎉",
    isCompleted:false
  },
  {
    id: 5,
    title: "The Venue Hunt",
    type: "essential",
    phase: "Building the Scenery",
    description: "Secure your ceremony and reception locations.",
    icon: "🏰",
    tips: [
      "Visit venues in person",
      "Check what's included in packages",
      "Book 12-18 months in advance for popular spots"
    ], isCompleted: false
  },
  {
    id: 6,
    title: "The Planner",
    type: "optional",
    phase: "Building the Scenery",
    description: "Consider hiring a full-service wedding planner or day-of coordinator.",
    icon: "📋",
    isCompleted:false
  },
  {
    id: 7,
    title: "The Photographer/Videographer",
    type: "essential",
    phase: "Building the Scenery",
    description: "Book your visual team to capture every moment.",
    icon: "📸",
    tips: [
      "Review full wedding galleries, not just highlights",
      "Meet them in person or via video call",
      "Discuss must-have shots and timeline"
    ], isCompleted: false
  },
  {
    id: 8,
    title: "The Caterer",
    type: "essential",
    phase: "Building the Scenery",
    description: "Select your catering service if not included with venue.",
    icon: "🍽️",
    tips: [
      "Schedule tastings",
      "Consider dietary restrictions",
      "Ask about service style options"
    ], isCompleted: false
  },
  {
    id: 9,
    title: "The Dress & Attire",
    type: "essential",
    phase: "The Look & Feel",
    description: "Find the perfect wedding dress, suits, and bridal party outfits.",
    icon: "👗",
    tips: [
      "Start shopping 9-12 months before",
      "Allow time for alterations",
      "Bring your most honest friend"
    ], isCompleted: false
  },
  {
    id: 10,
    title: "Decor & Florals",
    type: "essential",
    phase: "The Look & Feel",
    description: "Choose your color palette, centerpieces, and bouquets.",
    icon: "💐",
    tips: [
      "Create a mood board first",
      "Consider seasonal flowers for savings",
      "Think about scent as well as appearance"
    ], isCompleted: false
  },
  {
    id: 11,
    title: "The Website",
    type: "optional",
    phase: "The Look & Feel",
    description: "Create a wedding website for RSVPs and guest information.",
    icon: "🌐",
    isCompleted: false
  },
  {
    id: 12,
    title: "Music",
    type: "essential",
    phase: "The Entertainment & Details",
    description: "Book a DJ or live band for your celebration.",
    icon: "🎵",
    tips: [
      "Attend a live performance if possible",
      "Provide a do-not-play list",
      "Discuss music for key moments"
    ], isCompleted: false
  },
  {
    id: 13,
    title: "The Officiant",
    type: "essential",
    phase: "The Entertainment & Details",
    description: "Secure the person who will legally marry you.",
    icon: "✨",
    tips: [
      "Interview multiple officiants",
      "Discuss ceremony style and personalization",
      "Confirm they're legally authorized"
    ], isCompleted: false
  },
  {
    id: 14,
    title: "The Cake/Dessert",
    type: "optional",
    phase: "The Entertainment & Details",
    description: "Schedule tastings and book your sweet treats.",
    icon: "🎂",
    isCompleted: false
  },
  {
    id: 15,
    title: "Transportation",
    type: "optional",
    phase: "The Entertainment & Details",
    description: "Arrange shuttles for guests or special transport for the couple.",
    icon: "🚗",
    isCompleted: false
  },
  {
    id: 16,
    title: "Invitations",
    type: "essential",
    phase: "The Final Stretch",
    description: "Design and mail your wedding invitations.",
    icon: "✉️",
    tips: [
      "Send save-the-dates 6-8 months ahead",
      "Mail invitations 8-10 weeks before",
      "Order 10-15% extra for keepsakes"
    ], isCompleted: false
  },
  {
    id: 17,
    title: "Rings",
    type: "essential",
    phase: "The Final Stretch",
    description: "Purchase your wedding bands.",
    icon: "💍",
    tips: [
      "Shop 3-4 months before",
      "Get rings sized professionally",
      "Consider lifestyle when choosing metals"
    ], isCompleted: false
  },
  {
    id: 18,
    title: "Marriage License",
    type: "essential",
    phase: "The Final Stretch",
    description: "Obtain the legal paperwork required to marry.",
    icon: "📜",
    tips: [
      "Check local requirements and timing",
      "Bring required documents",
      "Know the validity period"
    ], isCompleted: false
  },
  {
    id: 19,
    title: "Rehearsal Dinner",
    type: "optional",
    phase: "The Final Stretch",
    description: "Plan dinner and practice for the night before.",
    icon: "🍷",
    isCompleted: false
  },
  {
    id: 20,
    title: "The Wedding Day",
    type: "essential",
    phase: "The Destination",
    description: "Your big day has arrived! Follow your timeline and enjoy every moment.",
    icon: "💒",
    tips: [
      "Eat breakfast!",
      "Build in buffer time",
      "Assign someone to handle emergencies",
      "Take a private moment together"
    ], isCompleted: false
  },
  {
    id: 21,
    title: "Honeymoon",
    type: "optional",
    phase: "The Destination",
    description: "Plan your post-wedding getaway and relaxation.",
    icon: "✈️",
    isCompleted: false
  },
];
