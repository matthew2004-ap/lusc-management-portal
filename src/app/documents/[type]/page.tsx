import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PrintButton from "@/components/PrintButton";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const member = user.member;

  if (!member || member.status !== "APPROVED") {
    notFound();
  }

  if (
    type === "certificate" &&
    (!member.tenureCompleted || !member.certificateIssued)
  ) {
    notFound();
  }

  if (type === "id-card" && !member.idCardIssued) {
    notFound();
  }

  if (type === "appointment" && !member.appointmentIssued) {
    notFound();
  }

  if (!["appointment", "id-card", "certificate"].includes(type)) {
    notFound();
  }

  const issued = (
    member.approvedAt || new Date()
  ).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tenure = process.env.TENURE_YEAR || "2026";
  const role = member.councilRole.title;

  return (
    <main className={`document-page ${type}`}>

      <div className="no-print document-toolbar">
        <a className="btn light" href="/documents">
          ← Back to documents
        </a>

        <span>
          Use Ctrl + P, then choose Save as PDF or your printer.
        </span>

        <PrintButton />
      </div>

      {/* PORTRAIT ID CARD */}

      {type === "id-card" ? (

        <article className="official-id-card">

          <div className="id-top">

            <div>
              <b>LANDMARK UNIVERSITY</b>
              <span>STUDENT COUNCIL</span>
            </div>

            <strong>
              OFFICIAL MEMBERSHIP IDENTITY CARD
            </strong>

          </div>

          <div className="id-body">

            {member.profilePhoto ? (
              <img
                className="id-photo"
                src={member.profilePhoto}
                alt="Member portrait"
              />
            ) : (
              <div className="id-photo id-placeholder">
                {user.fullName.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="id-details">

              <h1>{user.fullName}</h1>

              <p className="id-role">{role}</p>

              <p>
                <b>Membership ID</b>
                <br />
                {member.officialId}
              </p>

              <p>
                <b>Tenure</b>
                <br />
                {tenure}
              </p>

            </div>

          </div>

          <div className="id-footer">

            <span>
              LANDMARK UNIVERSITY STUDENT COUNCIL
            </span>

            <span>AUTHORISED MEMBER</span>

          </div>

        </article>

      ) : type === "certificate" ? (

        /* CERTIFICATE OF COMPLETION */

        <article className="certificate-sheet">

          <div className="certificate-inner">

            <div className="certificate-kicker">
              LANDMARK UNIVERSITY
            </div>

            <div className="certificate-subtitle">
              STUDENT COUNCIL · LUSC
            </div>

            <div className="certificate-rule" />

            <div className="certificate-label">
              CERTIFICATE OF
            </div>

            <h1>COMPLETION OF SERVICE</h1>

            <p className="certificate-intro">
              This certificate is proudly presented to
            </p>

            <h2>{user.fullName}</h2>

            <p className="certificate-copy">
              in recognition of the successful completion
              of service as <b>{role}</b> in the Landmark
              University Student Council during the{" "}
              <b>{tenure} tenure</b>.

              This certificate acknowledges the time,
              commitment and contribution rendered in the
              discharge of council responsibilities and
              service to the student community.
            </p>

            <p className="certificate-id">
              Membership ID: <b>{member.officialId}</b>
            </p>

            <p className="certificate-date">
              Issued this {issued}
            </p>

            <div className="certificate-signatures">

              <div>
                <span />
                <b>Vice-Chancellor of Membership (VCM) / VCF</b>
                <small>Authorised Council Signatory</small>
              </div>

              <div>
                <span />
                <b>President, Landmark University Student Council</b>
                <small>Presidential Signatory</small>
              </div>

            </div>

            <div className="certificate-foot">
              Issued by the Landmark University Student Council
              · Official record of service completion
            </div>

          </div>

        </article>

      ) : (

        /* APPOINTMENT LETTER */

        <article className="appointment-sheet">

          <div className="certificate-kicker">
            LANDMARK UNIVERSITY
          </div>

          <div className="certificate-subtitle">
            STUDENT COUNCIL · LUSC
          </div>

          <h1>OFFICIAL LETTER OF APPOINTMENT</h1>

          <p>Date: {issued}</p>

          <p>
            <b>To: {user.fullName}</b>
          </p>

          <p>
            Dear {user.fullName.split(" ")[0]},
          </p>

          <p>
            On behalf of the Landmark University Student
            Council, we are pleased to formally confirm
            your appointment as <b>{role}</b> for the{" "}
            {tenure} tenure, following the approval of
            your membership application.
          </p>

          <p>
            You are expected to discharge the
            responsibilities of this office with integrity,
            diligence, accountability and commitment to
            the welfare and advancement of the student
            community.
          </p>

          <p>
            Your official membership identification number
            is <b>{member.officialId}</b>. Please retain
            this letter for your records.
          </p>

          <p>
            Congratulations on your appointment. We wish
            you a productive and impactful tenure.
          </p>

          <div className="appointment-signatures">

            <div>
              ____________________________
              <br />
              <b>VCM / VCF</b>
              <br />
              Authorised Council Signatory
            </div>

            <div>
              ____________________________
              <br />
              <b>President, LUSC</b>
              <br />
              Presidential Signatory
            </div>

          </div>

        </article>

      )}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .document-page {
          min-height: 100vh;
          background: #e9eef4;
          padding: 24px;
          color: #172b45;
          font-family: Arial, sans-serif;
        }

        .document-toolbar {
          max-width: 1100px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .document-toolbar span {
          font-size: 12px;
          color: #607086;
        }

        /* CERTIFICATE */

        .certificate-sheet {
          width: 297mm;
          height: 210mm;
          padding: 13mm;
          background: white;
          margin: auto;
          border: 3px solid #b89650;
          box-shadow: 0 8px 30px #12243a18;
        }

        .certificate-inner {
          height: 100%;
          border: 1px solid #b89650;
          text-align: center;
          padding: 12mm 18mm;
          position: relative;
        }

        .certificate-kicker {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #16365a;
        }

        .certificate-subtitle {
          font-size: 12px;
          letter-spacing: 4px;
          color: #a17b32;
          margin-top: 8px;
        }

        .certificate-rule {
          height: 2px;
          width: 150px;
          background: #b89650;
          margin: 18px auto 14px;
        }

        .certificate-label {
          font-size: 12px;
          letter-spacing: 5px;
          color: #6e7c8e;
        }

        .certificate-sheet h1 {
          font-family: Georgia, serif;
          font-size: 31px;
          letter-spacing: 3px;
          color: #17365d;
          margin: 8px 0 14px;
        }

        .certificate-intro {
          font-size: 14px;
          color: #59697d;
        }

        .certificate-sheet h2 {
          font-family: Georgia, serif;
          font-size: 32px;
          color: #9a742e;
          border-bottom: 1px solid #d6c49b;
          display: inline-block;
          padding: 0 32px 8px;
        }

        .certificate-copy {
          font-size: 14px;
          line-height: 1.75;
          max-width: 800px;
          margin: 10px auto;
        }

        .certificate-id,
        .certificate-date {
          font-size: 12px;
          margin: 8px;
        }

        .certificate-signatures {
          display: flex;
          justify-content: space-around;
          gap: 60px;
          margin: 22px auto 0;
          max-width: 780px;
        }

        .certificate-signatures div {
          width: 42%;
          font-size: 11px;
        }

        .certificate-signatures span {
          display: block;
          border-top: 1px solid #28394d;
          margin-bottom: 7px;
        }

        .certificate-signatures small {
          display: block;
          color: #66778b;
          margin-top: 4px;
        }

        .certificate-foot {
          position: absolute;
          bottom: 9px;
          left: 0;
          right: 0;
          font-size: 9px;
          color: #738095;
        }

        /* PORTRAIT ID CARD */

        .official-id-card {
          width: 2.125in;
          height: 3.375in;
          margin: 35px auto;
          background: linear-gradient(
            155deg,
            #102b49 0%,
            #244f78 58%,
            #173653 100%
          );
          color: white;
          border-radius: 14px;
          padding: 15px 13px;
          box-shadow: 0 10px 28px #132a4430;
          position: relative;
          overflow: hidden;
          border: 1px solid #b99a58;
        }

        .id-top {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          border-bottom: 1px solid #ffffff55;
          padding-bottom: 10px;
          gap: 7px;
        }

        .id-top b {
          display: block;
          font-size: 10px;
          letter-spacing: 1.1px;
        }

        .id-top span {
          display: block;
          font-size: 7px;
          letter-spacing: 2px;
          color: #e3ca8c;
          margin-top: 3px;
        }

        .id-top strong {
          font-size: 7px;
          letter-spacing: 1px;
          color: #f0dfb4;
        }

        .id-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          text-align: center;
          padding-top: 12px;
        }

        .id-photo {
          width: 0.88in;
          height: 1.02in;
          object-fit: cover;
          object-position: center top;
          border: 2px solid #e6d39c;
          border-radius: 7px;
          background: #ffffff20;
        }

        .id-placeholder {
          display: grid;
          place-items: center;
          background: #ffffff20;
          font-size: 30px;
        }

        .id-details {
          text-align: center;
          width: 100%;
        }

        .id-details h1 {
          font-size: 12px;
          line-height: 1.2;
          margin: 0 0 5px;
        }

        .id-details p {
          font-size: 8px;
          line-height: 1.35;
          margin: 4px 0;
        }

        .id-role {
          color: #f0d58f;
          font-weight: 700;
        }

        .id-footer {
          position: absolute;
          bottom: 10px;
          left: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
          font-size: 6px;
          letter-spacing: .8px;
          color: #e2eaf2;
          border-top: 1px solid #ffffff55;
          padding-top: 6px;
        }

        /* APPOINTMENT LETTER */

        .appointment-sheet {
          background: white;
          max-width: 850px;
          min-height: 900px;
          margin: auto;
          padding: 70px 80px;
          line-height: 1.9;
          box-shadow: 0 8px 30px #12243a18;
        }

        .appointment-sheet h1 {
          text-align: center;
          color: #17365d;
          font-family: Georgia, serif;
          margin: 50px 0 30px;
        }

        .appointment-sheet p {
          font-size: 15px;
          margin: 18px 0;
        }

        .appointment-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 80px;
          font-size: 12px;
        }

        .appointment-signatures div {
          width: 42%;
        }

        @page certificate {
          size: A4 landscape;
          margin: 0;
        }

        @page idcard {
          size: 2.125in 3.375in;
          margin: 0;
        }

        @page appointment {
          size: A4 portrait;
          margin: 0;
        }

        .document-page.certificate {
          page: certificate;
        }

        .document-page.id-card {
          page: idcard;
        }

        .document-page.appointment {
          page: appointment;
        }

        @media print {

          html,
          body {
            margin: 0 !important;
            background: white !important;
          }

          .document-page {
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .certificate-sheet {
            box-shadow: none;
            margin: 0;
            width: 297mm;
            height: 210mm;
          }

          .official-id-card {
            width: 2.125in;
            height: 3.375in;
            margin: 0;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .document-page.id-card {
            width: 2.125in;
            height: 3.375in;
            min-height: 0;
            padding: 0;
            overflow: hidden;
          }

          .appointment-sheet {
            box-shadow: none;
            margin: 0;
            max-width: none;
            height: 297mm;
            padding: 25mm 30mm;
          }
        }

      `}</style>

    </main>
  );
}