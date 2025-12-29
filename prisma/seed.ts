// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// The data from your src/data/milestones.ts
const phasesData = [
  {
    title: "Setting the Coordinates",
    order: 1,
    milestones: [
      { id: 1, title: "Define the Budget", type: "essential", description: "Determine total spend and contributions from both families.", icon: "💰", tips: ["Be realistic about what you can afford", "Include a 10-15% buffer for unexpected costs", "Discuss contributions with family early"] },
      { id: 2, title: "The Guest List Draft", type: "essential", description: "Estimated headcount that determines venue size and catering needs.", icon: "📝", tips: ["Start with must-have guests", "Consider venue capacity", "Remember each guest impacts multiple costs"] },
      { id: 3, title: "Pick a Date/Season", type: "essential", description: "Narrow down to a month or specific weekend for your celebration.", icon: "📅", tips: ["Check availability of key guests", "Consider weather and season", "Weekday weddings can save money"] },
      { id: 4, title: "Engagement Party", type: "optional", description: "Book a venue or bar for an engagement celebration.", icon: "🎉", tips: [] },
    ]
  },
  {
    title: "Building the Scenery",
    order: 2,
    milestones: [
      { id: 5, title: "The Venue Hunt", type: "essential", description: "Secure your ceremony and reception locations.", icon: "🏰", tips: ["Visit venues in person", "Check what's included in packages", "Book 12-18 months in advance for popular spots"] },
      { id: 6, title: "The Planner", type: "optional", description: "Consider hiring a full-service wedding planner or day-of coordinator.", icon: "📋", tips: [] },
      { id: 7, title: "The Photographer/Videographer", type: "essential", description: "Book your visual team to capture every moment.", icon: "📸", tips: ["Review full wedding galleries, not just highlights", "Meet them in person or via video call", "Discuss must-have shots and timeline"] },
      { id: 8, title: "The Caterer", type: "essential", description: "Select your catering service if not included with venue.", icon: "🍽️", tips: ["Schedule tastings", "Consider dietary restrictions", "Ask about service style options"] },
    ]
  },
  {
    title: "The Look & Feel",
    order: 3,
    milestones: [
      { id: 9, title: "The Dress & Attire", type: "essential", description: "Find the perfect wedding dress, suits, and bridal party outfits.", icon: "👗", tips: ["Start shopping 9-12 months before", "Allow time for alterations", "Bring your most honest friend"] },
      { id: 10, title: "Decor & Florals", type: "essential", description: "Choose your color palette, centerpieces, and bouquets.", icon: "💐", tips: ["Create a mood board first", "Consider seasonal flowers for savings", "Think about scent as well as appearance"] },
      { id: 11, title: "The Website", type: "optional", description: "Create a wedding website for RSVPs and guest information.", icon: "🌐", tips: [] },
    ]
  },
  {
    title: "The Entertainment & Details",
    order: 4,
    milestones: [
      { id: 12, title: "Music", type: "essential", description: "Book a DJ or live band for your celebration.", icon: "🎵", tips: ["Attend a live performance if possible", "Provide a do-not-play list", "Discuss music for key moments"] },
      { id: 13, title: "The Officiant", type: "essential", description: "Secure the person who will legally marry you.", icon: "✨", tips: ["Interview multiple officiants", "Discuss ceremony style and personalization", "Confirm they're legally authorized"] },
      { id: 14, title: "The Cake/Dessert", type: "optional", description: "Schedule tastings and book your sweet treats.", icon: "🎂", tips: [] },
      { id: 15, title: "Transportation", type: "optional", description: "Arrange shuttles for guests or special transport for the couple.", icon: "🚗", tips: [] },
    ]
  },
  {
    title: "The Final Stretch",
    order: 5,
    milestones: [
      { id: 16, title: "Invitations", type: "essential", description: "Design and mail your wedding invitations.", icon: "✉️", tips: ["Send save-the-dates 6-8 months ahead", "Mail invitations 8-10 weeks before", "Order 10-15% extra for keepsakes"] },
      { id: 17, title: "Rings", type: "essential", description: "Purchase your wedding bands.", icon: "💍", tips: ["Shop 3-4 months before", "Get rings sized professionally", "Consider lifestyle when choosing metals"] },
      { id: 18, title: "Marriage License", type: "essential", description: "Obtain the legal paperwork required to marry.", icon: "📜", tips: ["Check local requirements and timing", "Bring required documents", "Know the validity period"] },
      { id: 19, title: "Rehearsal Dinner", type: "optional", description: "Plan dinner and practice for the night before.", icon: "🍷", tips: [] },
    ]
  },
  {
    title: "The Destination",
    order: 6,
    milestones: [
      { id: 20, title: "The Wedding Day", type: "essential", description: "Your big day has arrived! Follow your timeline and enjoy every moment.", icon: "💒", tips: ["Eat breakfast!", "Build in buffer time", "Assign someone to handle emergencies", "Take a private moment together"] },
      { id: 21, title: "Honeymoon", type: "optional", description: "Plan your post-wedding getaway and relaxation.", icon: "✈️", tips: [] },
    ]
  }
]

async function main() {
  console.log('Start seeding...')
  
  for (const phase of phasesData) {
    const createdPhase = await prisma.phase.upsert({
      where: { title: phase.title },
      update: {},
      create: {
        title: phase.title,
        order: phase.order,
      },
    })

    console.log(`Created phase: ${createdPhase.title}`)

    for (let i = 0; i < phase.milestones.length; i++) {
      const ms = phase.milestones[i]
      await prisma.milestone.upsert({
        where: { id: ms.id },
        update: {},
        create: {
          id: ms.id,
          title: ms.title,
          description: ms.description,
          type: ms.type,
          icon: ms.icon,
          tips: JSON.stringify(ms.tips), // Convert array to string for SQLite
          order: i + 1,
          phaseId: createdPhase.id
        }
      })
    }
  }
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })