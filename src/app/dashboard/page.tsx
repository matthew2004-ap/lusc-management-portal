import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/PortalShell";
import {
  UserCircle,
  CreditCard,
  ShieldCheck,
  Clock3,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  ClipboardCheck,
} from "lucide-react";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const member = user.member;

  const isManagement = ["ADMIN", "VCM", "VCF"].includes(
    user.accountRole
  );

  let statistics = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  if (isManagement) {
    const counts = await prisma.member.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const countByStatus = new Map(
      counts.map(({ status, _count }) => [status, _count._all])
    );

    statistics = {
      total: counts.reduce((total, { _count }) => total + _count._all, 0),
      pending: countByStatus.get("PENDING") ?? 0,
      approved: countByStatus.get("APPROVED") ?? 0,
      rejected: countByStatus.get("REJECTED") ?? 0,
    };
  }

  const status = member?.status || "PENDING";

  const statusInformation = {
    PENDING: {
      title: "Application under review",
      description:
        "Your application has been received. The VCM or VCF will review your information.",
      icon: Clock3,
      color: "pending",
    },
    APPROVED: {
      title: "Congratulations! You are approved.",
      description:
        "Your LUSC membership has been verified. You can now access your membership information.",
      icon: ShieldCheck,
      color: "approved",
    },
    REJECTED: {
      title: "Application requires attention",
      description:
        member?.rejectionReason ||
        "Please contact the council administration for further information.",
      icon: AlertCircle,
      color: "rejected",
    },
  }[status as "PENDING" | "APPROVED" | "REJECTED"];

  const profileFields = [
    user.fullName,
    member?.profilePhoto,
  ];

  const completedFields = profileFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const StatusIcon = statusInformation.icon;

  return (
    <PortalShell>
      {/* Welcome section */}
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">LUSC MEMBER PORTAL</span>

          <h1>
            Welcome, {user.fullName.split(" ")[0]}!
          </h1>

          <p>
            Your personal Student Council workspace.
            Everything you need is right here.
          </p>
        </div>

        <div className="welcome-avatar">
          {member?.profilePhoto ? (
            <img
              src={member.profilePhoto}
              alt="Profile photograph"
            />
          ) : (
            user.fullName.charAt(0).toUpperCase()
          )}
        </div>
      </section>

      {/* Management statistics */}
      {isManagement && (
        <section className="management-statistics">
          {[
            {
              label: "Total applicants",
              value: statistics.total,
              icon: Users,
            },
            {
              label: "Pending applications",
              value: statistics.pending,
              icon: Clock3,
            },
            {
              label: "Approved members",
              value: statistics.approved,
              icon: ShieldCheck,
            },
            {
              label: "Rejected applications",
              value: statistics.rejected,
              icon: AlertCircle,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div className="dashboard-stat" key={item.label}>
                <div className="dashboard-stat-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Application status */}
      <section className={`application-status ${statusInformation.color}`}>
        <div className="status-icon">
          <StatusIcon size={27} />
        </div>

        <div className="status-content">
          <span>APPLICATION STATUS</span>

          <h2>{statusInformation.title}</h2>

          <p>{statusInformation.description}</p>
        </div>

        <span className={`badge ${status}`}>
          {status}
        </span>
      </section>

      {/* Membership information */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>My membership</h2>
            <p>Your council information at a glance.</p>
          </div>
        </div>

        <div className="membership-grid">
          <div className="membership-card">
            <div className="membership-card-icon">
              <UserCircle size={21} />
            </div>

            <span>Official position</span>

            <strong>
              {member?.councilRole?.title || "Awaiting approval"}
            </strong>

            <small>
              {member?.status === "APPROVED"
                ? "Verified council position"
                : "Your requested position"}
            </small>
          </div>

          <div className="membership-card">
            <div className="membership-card-icon">
              <CreditCard size={21} />
            </div>

            <span>Membership ID</span>

            <strong className="membership-id">
              {member?.officialId || "Not assigned"}
            </strong>

            <small>
              Issued after application approval.
            </small>
          </div>

          <div className="membership-card">
            <div className="membership-card-icon">
              <ShieldCheck size={21} />
            </div>

            <span>Performance rating</span>

            <strong>
              {member?.status === "APPROVED"
                ? `${member.rating}/5`
                : "Not available"}
            </strong>

            <small>
              Council assessment.
            </small>
          </div>
        </div>
      </section>

      {/* Profile completion */}
      <section className="dashboard-profile-card">
        <div className="dashboard-profile-heading">
          <div>
            <h2>Complete your profile</h2>

            <p>
              Keep your personal and academic information updated.
            </p>
          </div>

          <strong>{profileCompletion}%</strong>
        </div>

        <div className="progress-track">
          <span
            style={{ width: `${profileCompletion}%` }}
          />
        </div>

        <div className="dashboard-profile-footer">
          <span>
            {profileCompletion === 100
              ? "Your profile is complete."
              : "Some information is still missing."}
          </span>

          <a href="/profile">
            Update profile <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Quick access */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Quick access</h2>
            <p>Go directly to the services you need.</p>
          </div>
        </div>

        <div className="quick-access-grid">
          <a href="/profile" className="quick-access-card">
            <UserCircle size={23} />

            <div>
              <strong>My profile</strong>
              <span>Personal information</span>
            </div>

            <ArrowRight size={17} />
          </a>

          <a href="/documents" className="quick-access-card">
            <FileText size={23} />

            <div>
              <strong>My documents</strong>
              <span>View available documents</span>
            </div>

            <ArrowRight size={17} />
          </a>

          {isManagement && (
            <a href="/approvals" className="quick-access-card">
              <ClipboardCheck size={23} />

              <div>
                <strong>Application approvals</strong>
                <span>Review applications</span>
              </div>

              <ArrowRight size={17} />
            </a>
          )}

          {user.accountRole === "ADMIN" && (
            <a href="/admin" className="quick-access-card">
              <Users size={23} />

              <div>
                <strong>Administration</strong>
                <span>Manage council records</span>
              </div>

              <ArrowRight size={17} />
            </a>
          )}
        </div>
      </section>

      {/* Application reminder */}
      {member?.status === "PENDING" && (
        <div className="dashboard-reminder">
          <Clock3 size={19} />

          <p>
            <strong>What happens next?</strong>
            Your application is awaiting review.
            You can update your profile while waiting.
          </p>
        </div>
      )}

      {member?.status === "APPROVED" && (
        <div className="dashboard-reminder approved-reminder">
          <CheckCircle2 size={19} />

          <p>
            <strong>Your membership is verified.</strong>
            Check your documents page for documents
            issued by the administrator.
          </p>
        </div>
      )}
    </PortalShell>
  );
}