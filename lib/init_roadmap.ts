import { prisma } from "./prisma";
import { milestones as defaultMilestones } from "@/data/milestones";

export async function init_roadmap (userId: string) {

    const roadmap = await prisma.roadmap.create({
        data: {
          userId: userId,
        },
      });

      // 2. Define Phase Order
      const phaseOrder = [
        "Setting the Coordinates",
        "Building the Scenery",
        "The Look & Feel",
        "The Entertainment & Details",
        "The Final Stretch",
        "The Destination",
      ];

      const phasesMap = new Map();

      // 3. Create Phases
      for (let i = 0; i < phaseOrder.length; i++) {
        const phaseTitle = phaseOrder[i];
        const newPhase = await prisma.phase.create({
          data: {
            title: phaseTitle,
            order: i + 1,
            roadmapId: roadmap.id,
          },
        });
        phasesMap.set(phaseTitle, newPhase.id);
      }

      // 4. Create Milestones
      for (const m of defaultMilestones) {
        const phaseId = phasesMap.get(m.phase);
        if (phaseId) {
          await prisma.milestone.create({
            data: {
              title: m.title,
              description: m.description,
              type: m.type,
              icon: m.icon,
              tips: JSON.stringify(m.tips || []),
              order: m.id,
              phaseId: phaseId,
              isCompleted: false,
            },
          });
        }
      }
      console.log("✅ Roadmap generated successfully for:", userId);
}
