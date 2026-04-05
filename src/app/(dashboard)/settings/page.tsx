import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  let settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        userId: session.user.id,
        impactWeight: 0.35,
        urgencyWeight: 0.20,
        confidenceWeight: 0.15,
        painWeight: 0.20,
        effortWeight: 0.10,
      },
    });
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Settings"
        description="Configure scoring weights and preferences"
      />
      <div className="p-6 max-w-2xl">
        <SettingsForm
          initialSettings={{
            impactWeight: settings.impactWeight,
            urgencyWeight: settings.urgencyWeight,
            confidenceWeight: settings.confidenceWeight,
            painWeight: settings.painWeight,
            effortWeight: settings.effortWeight,
          }}
        />
      </div>
    </div>
  );
}
