import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ImgControl",
  description:
    "Read the ImgControl Privacy Policy to understand how information, cookies, analytics, advertising and website usage are handled.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main>
      {/* HEADER */}
      <section className="pageHead">
        <div className="container">
          <div className="kicker">PRIVACY</div>

          <h1>Privacy Policy</h1>

          <p>
            This Privacy Policy explains how ImgControl handles information
            when you visit and use our website, image tools, PDF tools and
            related services.
          </p>

          <p
            style={{
              marginBottom: 0,
              fontSize: 13,
              opacity: 0.75,
            }}
          >
            Last updated: September 8, 2026
          </p>
        </div>
      </section>

      {/* POLICY */}
      <section className="section">
        <div className="container">
          <article
            className="card"
            style={{
              maxWidth: 950,
              margin: "0 auto",
              padding: 28,
            }}
          >
            <h2>1. Introduction</h2>

            <p>
              Welcome to ImgControl. We provide online tools and resources for
              working with digital images and PDF files, including image
              compression, image conversion, image resizing, image cropping
              and PDF conversion.
            </p>

            <p>
              We respect your privacy and aim to handle information in a
              transparent and responsible manner. This Privacy Policy
              describes what information may be collected, how it may be used,
              and the choices that may be available to you when using
              ImgControl.
            </p>

            <p>
              By accessing or using ImgControl, you acknowledge this Privacy
              Policy.
            </p>

            <h2>2. Information We Collect</h2>

            <p>
              The information collected through ImgControl depends on how you
              use the website.
            </p>

            <h3>Information You Provide</h3>

            <p>
              ImgControl may receive information that you voluntarily provide,
              for example when you contact us by email, submit feedback, ask a
              question or otherwise communicate with us.
            </p>

            <p>
              For example, if you contact us at{" "}
              <a href="mailto:mayastudiosofficial@gmail.com">
                mayastudiosofficial@gmail.com
              </a>
              , we may receive your email address, message and any information
              that you choose to include in your communication.
            </p>

            <h3>Files You Upload</h3>

            <p>
              Some ImgControl tools allow you to select image or PDF files for
              processing. Depending on the particular tool and browser
              capabilities, file processing may take place within your
              browser.
            </p>

            <p>
              We do not use your uploaded files for unrelated purposes.
              However, you should avoid uploading sensitive or confidential
              information unless you are comfortable using the specific tool
              and its processing method.
            </p>

            <h3>Automatically Collected Information</h3>

            <p>
              Like many websites, ImgControl may be accessed through browsers
              and devices that provide basic technical information. Depending
              on the technologies enabled on the website, this may include
              information such as browser type, device type, operating system,
              approximate geographic information, pages visited, referring
              pages and general usage information.
            </p>

            <h2>3. How We Use Information</h2>

            <p>
              Information may be used for legitimate website and service
              purposes, including:
            </p>

            <p>
              providing and maintaining ImgControl;
              <br />
              improving website performance and usability;
              <br />
              understanding how visitors use the website;
              <br />
              responding to support requests and feedback;
              <br />
              detecting technical issues and abuse;
              <br />
              protecting the security and integrity of the website; and
              <br />
              improving existing tools and developing useful new features.
            </p>

            <p>
              We do not intend to use information collected through ordinary
              website interaction for purposes unrelated to providing,
              maintaining, securing and improving ImgControl unless otherwise
              explained or required by applicable law.
            </p>

            <h2>4. Browser-Based File Processing</h2>

            <p>
              Some ImgControl tools are designed to process files directly in
              the user's browser. When a tool operates in this manner, the
              selected file can be processed locally on the device without
              requiring the file to be uploaded to our server for the core
              conversion process.
            </p>

            <p>
              The exact processing behavior can vary by tool and browser.
              Users should therefore review the behavior of the particular
              tool they are using and avoid submitting files containing highly
              sensitive information unless appropriate.
            </p>

            <h2>5. Cookies</h2>

            <p>
              ImgControl or third-party services used on the website may use
              cookies or similar technologies.
            </p>

            <p>
              Cookies are small pieces of data that can be stored on a user's
              device and may be used for purposes such as remembering
              preferences, supporting website functionality, measuring usage,
              security or serving relevant advertising.
            </p>

            <p>
              Your browser generally provides controls that allow you to
              manage, block or delete cookies. Disabling certain cookies may
              affect some website functions.
            </p>

            <h2>6. Analytics</h2>

            <p>
              ImgControl may use analytics or measurement technologies to
              understand website traffic, page usage and general visitor
              behavior.
            </p>

            <p>
              Analytics information can help us understand which pages and
              features are useful, identify technical problems and improve the
              website experience.
            </p>

            <p>
              Where third-party analytics services are used, those services may
              process information in accordance with their own privacy
              policies.
            </p>

            <h2>7. Advertising</h2>

            <p>
              ImgControl may display advertisements provided by third-party
              advertising services, including Google and its advertising
              partners.
            </p>

            <p>
              Advertising providers may use cookies or similar technologies to
              help deliver, measure or personalize advertisements, subject to
              their own policies and applicable privacy choices.
            </p>

            <p>
              Advertisements may be selected based on contextual information,
              general audience information or other signals permitted by the
              relevant advertising platform.
            </p>

            <p>
              Users may have options to manage personalized advertising through
              their browser, device or the relevant advertising provider's
              privacy controls.
            </p>

            <h2>8. Third-Party Services</h2>

            <p>
              ImgControl may rely on third-party services for functions such as
              hosting, analytics, security, advertising, content delivery or
              other website infrastructure.
            </p>

            <p>
              These third parties may process certain technical or usage
              information as necessary to provide their services.
            </p>

            <p>
              Third-party services operate under their own terms and privacy
              policies, and ImgControl does not control how independent
              third-party providers handle information outside the services
              integrated into our website.
            </p>

            <h2>9. External Links</h2>

            <p>
              ImgControl may contain links to external websites, services,
              resources or tools.
            </p>

            <p>
              We are not responsible for the privacy practices, security,
              content or policies of third-party websites. Before providing
              information to an external service, you should review that
              service's privacy policy and terms.
            </p>

            <h2>10. Data Security</h2>

            <p>
              We take reasonable steps to protect the website and information
              associated with its operation. However, no website, internet
              transmission or electronic storage system can be guaranteed to be
              completely secure.
            </p>

            <p>
              You should therefore use appropriate caution when sharing
              information online and avoid submitting unnecessary sensitive
              personal information.
            </p>

            <h2>11. Data Retention</h2>

            <p>
              Information may be retained for as long as reasonably necessary
              for the purposes described in this Privacy Policy, to provide
              services, maintain records, resolve disputes, enforce agreements,
              maintain security or comply with legal obligations.
            </p>

            <p>
              Retention periods may vary depending on the type and purpose of
              the information.
            </p>

            <h2>12. Children's Privacy</h2>

            <p>
              ImgControl is not intended to knowingly collect personal
              information from children in violation of applicable law.
            </p>

            <p>
              If you believe that a child has provided personal information
              through the website in a manner that should not have occurred,
              please contact us so that the matter can be reviewed.
            </p>

            <h2>13. Your Choices</h2>

            <p>
              Depending on your location and applicable law, you may have
              certain rights relating to personal information, such as rights
              to request access, correction, deletion or other forms of
              control.
            </p>

            <p>
              You can also manage certain browser-level settings, including
              cookies, permissions and privacy preferences, through your
              device or browser.
            </p>

            <p>
              To make a privacy-related request, please contact us using the
              email address provided below.
            </p>

            <h2>14. International Visitors</h2>

            <p>
              ImgControl may be accessible to users in different countries.
              Depending on the hosting providers, infrastructure and
              third-party services involved, information may be processed in
              countries other than the country where you live.
            </p>

            <p>
              By using the website, you acknowledge that information may be
              processed in locations where the relevant service providers
              operate, subject to applicable laws and contractual safeguards
              where required.
            </p>

            <h2>15. Privacy and Image/PDF Files</h2>

            <p>
              Users should be careful when processing documents or images that
              contain personal, financial, medical, business, identification or
              other confidential information.
            </p>

            <p>
              Before using an online tool, consider the sensitivity of the file
              and whether the tool's processing method is appropriate for your
              particular situation.
            </p>

            <h2>16. Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in the website, technologies, services, legal requirements
              or business practices.
            </p>

            <p>
              When changes are made, the updated version will be published on
              this page with a revised “Last updated” date.
            </p>

            <h2>17. Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy, privacy
              practices or a request relating to your information, please
              contact:
            </p>

            <div
              style={{
                marginTop: 18,
                padding: 20,
                borderRadius: 16,
                background:
                  "linear-gradient(145deg, #0d2c42, #071b29)",
                color: "#fff",
                boxShadow: "0 12px 25px rgba(0,0,0,.16)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>ImgControl</h3>

              <p style={{ marginBottom: 8 }}>
                Email:
              </p>

              <a
                href="mailto:mayastudiosofficial@gmail.com"
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  textDecoration: "none",
                  wordBreak: "break-word",
                }}
              >
                mayastudiosofficial@gmail.com
              </a>
            </div>

            <div
              style={{
                marginTop: 34,
                paddingTop: 24,
                borderTop: "1px solid rgba(128,128,128,.2)",
              }}
            >
              <p style={{ marginBottom: 0 }}>
                Please also review our{" "}
                <Link href="/terms">Terms of Use</Link> and{" "}
                <Link href="/contact">Contact</Link> page.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}