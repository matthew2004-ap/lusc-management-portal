import Link from "next/link";

import {
  LogOut,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  UserCircle,
  FileText,
  MessageCircle,
  Bell,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getCurrentUser();

  const admin = user?.accountRole === "ADMIN";

  const approver = [
    "VCM",
    "VCF",
    "ADMIN",
  ].includes(user?.accountRole || "");

  const unread = user
    ? await prisma.notification.count({
        where: {
          userId: user.id,
          readAt: null,
        },
      })
    : 0;

  return (

    <div className="shell">

      <aside className="sidebar no-print">

        <div className="brand">

          LANDMARK UNIVERSITY

          <small>
            STUDENT COUNCIL · LUSC
          </small>

        </div>

        <nav className="nav">

          <Link href="/dashboard">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <Link href="/profile">
            <UserCircle size={16} />
            My Profile
          </Link>

          <Link href="/documents">
            <FileText size={16} />
            My Documents
          </Link>

          <Link href="/messages">
            <MessageCircle size={16} />
            Messages
          </Link>

          <Link href="/notifications">
            <Bell size={16} />
            Notifications
            {unread > 0 ? ` (${unread})` : ""}
          </Link>

          {approver && (

            <Link href="/approvals">
              <ClipboardCheck size={16} />
              Approval Queue
            </Link>

          )}

          {admin && (

            <Link href="/admin">
              <Users size={16} />
              Administration
            </Link>

          )}

        </nav>

        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "#c5d2e2",
          }}
        >
          Secure council workspace
          <br />
          Tenure 2026
        </div>

      </aside>

      <div className="main">

        <header className="topbar no-print">

          <div>

            <b>Management Portal</b>

            <div
              className="subtle"
              style={{ fontSize: 12 }}
            >
              Landmark University Student Council
            </div>

          </div>

          <div className="row">

            <span style={{ fontSize: 13 }}>
              {user?.fullName}
            </span>

            <form
              action="/api/auth/logout"
              method="post"
            >

              <button
                className="btn light"
                type="submit"
              >
                <LogOut size={15} />
                Sign out
              </button>

            </form>

          </div>

        </header>

        <main className="content">
          {children}
        </main>

      </div>

    </div>

  );
}