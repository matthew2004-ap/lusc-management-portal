import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/PortalShell";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  return (
    <PortalShell>
      <h1 className="page-title">Notifications</h1>

      <p className="subtle">
        Updates and messages sent to your account.
      </p>

      <div
        className="card"
        style={{ marginTop: 20 }}
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: "14px 4px",
              borderBottom: "1px solid #edf1f5"
            }}
          >
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "start"
              }}
            >
              <b>{n.title}</b>

              <small className="subtle">
                {n.createdAt.toLocaleString("en-NG")}
              </small>
            </div>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                margin: "7px 0"
              }}
            >
              {n.body}
            </p>

            {n.link && (
              <a
                href={n.link}
                style={{
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                Open conversation →
              </a>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="empty-state">
            You have no notifications yet.
          </p>
        )}
      </div>
    </PortalShell>
  );
}