import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ImgControl | Get in Touch",
  description:
    "Contact ImgControl for questions, feedback, technical issues, suggestions or general inquiries about our image and PDF tools.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main>
      {/* HERO */}
      <section className="pageHead">
        <div className="container">
          <div className="kicker">CONTACT IMGCONTROL</div>

          <h1>Get in Touch with ImgControl</h1>

          <p>
            Have a question, suggestion, technical issue or feedback about
            ImgControl? We would be happy to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="section">
        <div className="container">
          <div
            className="contact-grid"
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 22,
              alignItems: "stretch",
            }}
          >
            {/* LEFT CARD */}
            <div
              className="card"
              style={{
                padding: 26,
              }}
            >
              <h2>Contact Us</h2>

              <p>
                ImgControl is designed to provide simple and practical tools
                for working with images and PDF files. We welcome feedback
                that can help us improve the website, tools and user
                experience.
              </p>

              <p>
                You can contact us about technical problems, conversion issues,
                incorrect results, website feedback, tool suggestions,
                questions about our services or other general inquiries.
              </p>

              <h2 style={{ marginTop: 30 }}>Email Support</h2>

              <p>
                For general questions and support, please contact us by email.
              </p>

              <a
                href="mailto:mayastudiosofficial@gmail.com"
                className="contact-email-button"
              >
                mayastudiosofficial@gmail.com
              </a>

              <h2 style={{ marginTop: 32 }}>
                What Can You Contact Us About?
              </h2>

              <p>
                You can contact us regarding image compression, image
                conversion, resizing, cropping, PDF conversion, supported file
                formats, website issues, broken links, tool suggestions,
                general feedback and other ImgControl-related questions.
              </p>

              <p style={{ marginBottom: 0 }}>
                When reporting a technical problem, please describe what you
                were trying to do and what happened. If possible, include the
                name of the tool you were using and the type of file involved.
              </p>
            </div>

            {/* RIGHT CARD */}
            <div
              className="card"
              style={{
                padding: 26,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2>Before Sending an Email</h2>

                <p>
                  To help us understand your request, please include as much
                  relevant information as possible.
                </p>

                <div
                  style={{
                    marginTop: 18,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      padding: 15,
                      borderRadius: 14,
                      background: "rgba(25,125,220,.06)",
                      border: "1px solid rgba(25,125,220,.12)",
                    }}
                  >
                    <strong>1. Tool name</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Tell us which ImgControl tool you were using.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: 15,
                      borderRadius: 14,
                      background: "rgba(25,125,220,.06)",
                      border: "1px solid rgba(25,125,220,.12)",
                    }}
                  >
                    <strong>2. What happened?</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Describe the problem or question clearly.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: 15,
                      borderRadius: 14,
                      background: "rgba(25,125,220,.06)",
                      border: "1px solid rgba(25,125,220,.12)",
                    }}
                  >
                    <strong>3. File type</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Mention the format, such as JPG, PNG, HEIC, RAW or PDF.
                    </p>
                  </div>
                </div>
              </div>

              {/* EMAIL BOX */}
              <div
                style={{
                  marginTop: 26,
                  padding: 20,
                  borderRadius: 16,
                  background:
                    "linear-gradient(145deg, #0d2c42, #071b29)",
                  color: "#fff",
                  boxShadow: "0 12px 25px rgba(0,0,0,.16)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Email Address</h3>

                <a
                  href="mailto:mayastudiosofficial@gmail.com"
                  className="contact-email-link"
                >
                  mayastudiosofficial@gmail.com
                </a>

                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 13,
                    opacity: 0.78,
                  }}
                >
                  Click the email address to start a new email.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div
            className="card"
            style={{
              maxWidth: 1000,
              margin: "24px auto 0",
              padding: 26,
            }}
          >
            <h2>Frequently Asked Questions</h2>

            <h3>How do I contact ImgControl?</h3>

            <p>
              You can contact ImgControl at{" "}
              <a href="mailto:mayastudiosofficial@gmail.com">
                mayastudiosofficial@gmail.com
              </a>
              .
            </p>

            <h3>Can I report a technical problem?</h3>

            <p>
              Yes. Please describe the problem, mention the tool you were
              using and provide relevant details about the file or conversion
              process.
            </p>

            <h3>Can I suggest a new tool?</h3>

            <p>
              Yes. We welcome suggestions for new image and PDF tools and
              improvements to existing workflows.
            </p>

            <h3>Can I contact ImgControl about a broken page?</h3>

            <p>
              Yes. Please include the page or tool name and explain what you
              expected to happen and what you experienced.
            </p>

            <h3>What should I include in a support email?</h3>

            <p style={{ marginBottom: 0 }}>
              Include the tool name, the type of file you were working with,
              what you were trying to do and a clear description of the issue.
            </p>
          </div>
        </div>
      </section>

      {/* HOVER + RESPONSIVE */}
      <style>{`
        .contact-email-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 20px;
          border-radius: 13px;
          background:
            linear-gradient(
              145deg,
              #279bff 0%,
              #0873d8 55%,
              #055eb7 100%
            );
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          box-shadow:
            0 5px 0 #044f99,
            0 10px 20px rgba(0,0,0,.18),
            inset 0 1px 0 rgba(255,255,255,.4);
          transition:
            transform .18s ease,
            filter .18s ease,
            box-shadow .18s ease;
          word-break: break-word;
        }

        .contact-email-button:hover {
          transform: translateY(-3px);
          filter: brightness(1.08);
          box-shadow:
            0 7px 0 #044f99,
            0 14px 24px rgba(0,0,0,.2),
            inset 0 1px 0 rgba(255,255,255,.45);
        }

        .contact-email-link {
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          word-break: break-word;
        }

        .contact-email-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 800px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 500px) {
          .contact-email-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}