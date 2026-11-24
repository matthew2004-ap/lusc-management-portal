import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PortalShell from "@/components/PortalShell";

export default async function DocumentsPage() {

  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const member = user.member;
  const approved = member?.status === "APPROVED";

  return (
    <PortalShell>

      <h1 className="page-title">
        My Documents
      </h1>

      <p className="subtle">
        Official documents available for your membership record.
      </p>

      <div
        className="grid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))"
        }}
      >

        {/* APPOINTMENT LETTER */}

        <div className="card">

          <h3>Appointment Letter</h3>

          <p className="subtle">
            Official appointment confirmation issued after approval.
          </p>

          {approved && member?.appointmentIssued ? (

            <a
              className="btn"
              href="/documents/appointment"
            >
              View / Print
            </a>

          ) : (

            <span className="badge PENDING">
              Awaiting admin issuance
            </span>

          )}

        </div>

        {/* ID CARD */}

        <div className="card">

          <h3>Official ID Card</h3>

          <p className="subtle">
            Council identification card with your photograph
            and unique membership ID.
          </p>

          {approved && member?.idCardIssued ? (

            <a
              className="btn"
              href="/documents/id-card"
            >
              View / Print
            </a>

          ) : (

            <span className="badge PENDING">
              Awaiting admin issuance
            </span>

          )}

        </div>

        {/* CERTIFICATE */}

        <div className="card">

          <h3>Certificate of Completion</h3>

          <p className="subtle">
            Official certificate recognising successful
            completion of council service.
          </p>

          {approved &&
          member?.tenureCompleted &&
          member?.certificateIssued ? (

            <a
              className="btn"
              href="/documents/certificate"
            >
              View / Print
            </a>

          ) : (

            <span className="badge PENDING">
              Awaiting tenure completion and admin issuance
            </span>

          )}

        </div>

      </div>

    </PortalShell>
  );
}