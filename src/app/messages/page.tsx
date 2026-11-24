import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/PortalShell";

type Props = {
  searchParams: Promise<{ with?: string; sent?: string }>;
};

export default async function MessagesPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { with: selectedId = "" } = await searchParams;

  const management = ["ADMIN", "VCM", "VCF"].includes(
    user.accountRole
  );

  const history = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { recipientId: user.id }
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      senderId: true,
      recipientId: true
    }
  });

  const counterpartIds = [
    ...new Set(
      history.map((m) =>
        m.senderId === user.id
          ? m.recipientId
          : m.senderId
      )
    )
  ];

  const contacts = management
    ? await prisma.user.findMany({
        where: {
          id: { in: counterpartIds },
          NOT: { id: user.id }
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          accountRole: true
        },
        orderBy: { fullName: "asc" }
      })
    : await prisma.user.findMany({
        where: {
          accountRole: {
            in: ["ADMIN", "VCM", "VCF"]
          }
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          accountRole: true
        },
        orderBy: [
          { accountRole: "asc" },
          { fullName: "asc" }
        ]
      });

  const selected =
    contacts.find((c) => c.id === selectedId) ||
    contacts[0] ||
    null;

  if (selected) {
    await prisma.message.updateMany({
      where: {
        senderId: selected.id,
        recipientId: user.id,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });
  }

  const messages = selected
    ? await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: user.id,
              recipientId: selected.id
            },
            {
              senderId: selected.id,
              recipientId: user.id
            }
          ]
        },
        orderBy: { createdAt: "asc" },
        take: 150,
        include: {
          sender: {
            select: { fullName: true }
          }
        }
      })
    : [];

  return (
    <PortalShell>
      <h1 className="page-title">Messages</h1>

      <p className="subtle">
        Private conversations with LUSC applicants
        and authorised council officers.
      </p>

      <div
        className="grid"
        style={{
          gridTemplateColumns:
            "minmax(220px, .75fr) minmax(0, 2fr)",
          alignItems: "start",
          marginTop: 20
        }}
      >
        <section className="card">
          <h3>
            {management
              ? "Applicant conversations"
              : "Council offices"}
          </h3>

          {contacts.map((c) => (
            <a
              key={c.id}
              href={`/messages?with=${c.id}`}
              style={{
                display: "block",
                padding: "12px 8px",
                borderBottom: "1px solid #edf1f5",
                background:
                  selected?.id === c.id
                    ? "#f0f5fb"
                    : "transparent",
                color: "inherit",
                textDecoration: "none",
                borderRadius: 8
              }}
            >
              <b>{c.fullName}</b>

              <div className="subtle" style={{ fontSize: 11 }}>
                {c.accountRole} · {c.email}
              </div>
            </a>
          ))}

          {contacts.length === 0 && (
            <p className="subtle">
              No conversations yet.
            </p>
          )}
        </section>

        <section className="card">
          {selected ? (
            <>
              <div
                style={{
                  paddingBottom: 12,
                  borderBottom: "1px solid #edf1f5"
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {selected.fullName}
                </h3>

                <p className="subtle">
                  {selected.accountRole}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  padding: "18px 0",
                  maxHeight: 460,
                  overflowY: "auto"
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      justifySelf:
                        m.senderId === user.id
                          ? "end"
                          : "start",
                      maxWidth: "85%",
                      background:
                        m.senderId === user.id
                          ? "#eaf2fb"
                          : "#f4f6f8",
                      padding: "11px 14px",
                      borderRadius: 12
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#63758b",
                        marginBottom: 5
                      }}
                    >
                      {m.senderId === user.id
                        ? "You"
                        : m.sender.fullName}
                    </div>

                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        fontSize: 13
                      }}
                    >
                      {m.body}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: "#8795a7",
                        marginTop: 6
                      }}
                    >
                      {m.createdAt.toLocaleString("en-NG")}
                    </div>
                  </div>
                ))}

                {messages.length === 0 && (
                  <p className="subtle">
                    No messages in this conversation yet.
                  </p>
                )}
              </div>

              <form
                action="/api/messages/send"
                method="post"
                style={{
                  borderTop: "1px solid #edf1f5",
                  paddingTop: 14
                }}
              >
                <input
                  type="hidden"
                  name="recipientId"
                  value={selected.id}
                />

                <div className="field">
                  <label>Write a message</label>

                  <textarea
                    name="body"
                    required
                    maxLength={5000}
                    rows={4}
                    placeholder="Type your message here…"
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #d8e0ea",
                      borderRadius: 9,
                      resize: "vertical"
                    }}
                  />
                </div>

                <button className="btn">
                  Send message →
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              No recipient is available yet.
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}