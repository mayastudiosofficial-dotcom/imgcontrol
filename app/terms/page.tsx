import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | ImgControl",
  description:
    "Read the ImgControl Terms of Use covering website access, image and PDF tools, acceptable use, user responsibilities, intellectual property, limitations and other important terms.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main>
      {/* HERO */}
      <section className="pageHead">
        <div className="container">
          <div className="kicker">TERMS</div>

          <h1>Terms of Use</h1>

          <p>
            These Terms of Use explain the rules and conditions that apply when
            you access or use ImgControl, including our image tools, PDF tools,
            website content and related services.
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

      {/* TERMS CONTENT */}
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
            <h2>1. Acceptance of These Terms</h2>

            <p>
              Welcome to ImgControl. By accessing or using this website, you
              agree to be bound by these Terms of Use, our Privacy Policy and
              any other applicable policies or notices published on the
              website.
            </p>

            <p>
              If you do not agree with these terms, please do not use
              ImgControl.
            </p>

            <h2>2. About ImgControl</h2>

            <p>
              ImgControl is an online toolbox that provides image and PDF
              related utilities and informational resources. Available tools
              may include image compression, image conversion, image resizing,
              image cropping, PDF conversion and other file-processing
              utilities.
            </p>

            <p>
              Features, tools, supported formats and website content may change
              over time without prior notice.
            </p>

            <h2>3. Use of the Website</h2>

            <p>
              You may use ImgControl for lawful personal, educational,
              professional and business purposes, provided that your use
              complies with these Terms and applicable laws.
            </p>

            <p>
              You agree not to use the website in a way that could damage,
              disable, overburden or interfere with the normal operation,
              security or availability of ImgControl.
            </p>

            <h2>4. Image and PDF Tools</h2>

            <p>
              ImgControl provides tools intended to help users perform common
              image and PDF processing tasks.
            </p>

            <p>
              Because file formats, source files, browsers, devices and
              processing environments can vary, we do not guarantee that every
              file will be successfully processed or that every conversion will
              produce the exact result expected by a user.
            </p>

            <p>
              You are responsible for reviewing the output of any conversion,
              compression, resizing, cropping or other file-processing
              operation before using or sharing the resulting file.
            </p>

            <h2>5. User Responsibility for Uploaded Files</h2>

            <p>
              You are responsible for the files you select, upload or process
              using ImgControl and for ensuring that you have the necessary
              rights or permissions to use those files.
            </p>

            <p>
              You must not use ImgControl to process, distribute or facilitate
              unlawful material or content that you do not have the legal
              authority to use.
            </p>

            <p>
              You should maintain your own backup of important files. ImgControl
              should not be treated as a permanent file-storage or backup
              service.
            </p>

            <h2>6. No Guarantee of File Preservation</h2>

            <p>
              Digital files can be affected by device limitations, browser
              behavior, software compatibility, file corruption, unexpected
              errors and other technical conditions.
            </p>

            <p>
              Although we aim to provide useful and reliable tools, we do not
              guarantee that files will always be processed, preserved,
              downloadable or reproduced without errors.
            </p>

            <p>
              Always keep an original copy of important images, documents and
              other files before processing them.
            </p>

            <h2>7. Browser-Based Processing</h2>

            <p>
              Some ImgControl tools may process files directly within the
              user's browser or device, depending on the specific tool and
              browser environment.
            </p>

            <p>
              Performance and supported file sizes can vary between devices,
              browsers and operating systems.
            </p>

            <p>
              A conversion that works on one device may perform differently on
              another device because of available memory, browser capabilities,
              file size or other technical limitations.
            </p>

            <h2>8. Acceptable Use</h2>

            <p>
              You agree not to use ImgControl for activities that violate
              applicable laws or regulations.
            </p>

            <p>
              You must not attempt to gain unauthorized access to the website,
              interfere with its infrastructure, bypass security controls,
              introduce malicious code, abuse automated systems or intentionally
              disrupt service availability.
            </p>

            <p>
              You must also not use the website in a manner that creates
              unreasonable technical load or interferes with other users'
              access to the service.
            </p>

            <h2>9. Prohibited Activities</h2>

            <p>
              Examples of prohibited activities include attempting to hack,
              exploit, reverse engineer or disrupt the website; using the
              service for unlawful activities; distributing malicious files or
              code; abusing automated requests; and attempting to bypass
              technical or security restrictions.
            </p>

            <p>
              We reserve the right to restrict or terminate access where we
              reasonably believe that the website is being misused or these
              Terms are being violated.
            </p>

            <h2>10. Intellectual Property</h2>

            <p>
              Unless otherwise stated, the ImgControl website, branding,
              interface, design elements, logos, original written content,
              graphics and website code are protected by applicable intellectual
              property laws.
            </p>

            <p>
              You may use ImgControl in accordance with these Terms, but you do
              not acquire ownership of the website, its branding, software,
              original content or other protected materials merely by using the
              service.
            </p>

            <h2>11. User-Owned Content</h2>

            <p>
              You retain your rights to files and content that you own and
              process through ImgControl, subject to any rights required by the
              services or technologies used to provide a particular feature.
            </p>

            <p>
              ImgControl does not claim ownership of your original photographs,
              documents or other user-created files merely because you use a
              processing tool.
            </p>

            <h2>12. Website Content and Information</h2>

            <p>
              ImgControl may publish guides, tutorials, comparisons, tips,
              descriptions and other informational content relating to image
              and PDF workflows.
            </p>

            <p>
              Such information is provided for general informational purposes
              and may not be suitable for every technical, professional or
              business situation.
            </p>

            <p>
              You should independently evaluate information before relying on
              it for important decisions.
            </p>

            <h2>13. Accuracy of Information</h2>

            <p>
              We make reasonable efforts to keep website content useful and
              accurate, but we do not guarantee that every page, description,
              specification or article will always be complete, current or
              error-free.
            </p>

            <p>
              Technical standards, browsers, operating systems, supported file
              formats and third-party services can change over time.
            </p>

            <h2>14. Third-Party Services</h2>

            <p>
              ImgControl may use third-party providers for hosting, analytics,
              advertising, security, infrastructure or other website
              functionality.
            </p>

            <p>
              Third-party services are operated by independent providers and
              may be subject to their own terms and privacy policies.
            </p>

            <p>
              We are not responsible for independent third-party websites,
              applications or services that you access through external links
              or integrations.
            </p>

            <h2>15. External Links</h2>

            <p>
              ImgControl may contain links to external websites or resources.
              These links may be provided for convenience, additional
              information or access to third-party services.
            </p>

            <p>
              We do not control the content, availability, security or privacy
              practices of external websites and are not responsible for their
              policies or activities.
            </p>

            <h2>16. Advertising</h2>

            <p>
              ImgControl may display advertisements provided by third-party
              advertising networks or partners.
            </p>

            <p>
              Advertisements may be selected, delivered or measured using
              technologies controlled by the relevant advertising provider and
              may be subject to that provider's own terms and policies.
            </p>

            <h2>17. Availability of the Service</h2>

            <p>
              We aim to keep ImgControl accessible and useful, but we do not
              guarantee uninterrupted or error-free availability.
            </p>

            <p>
              The website may occasionally be unavailable because of
              maintenance, software updates, technical problems, hosting
              issues, security incidents or circumstances outside our control.
            </p>

            <h2>18. Disclaimer of Warranties</h2>

            <p>
              ImgControl is provided on an “as available” and “as is” basis to
              the extent permitted by applicable law.
            </p>

            <p>
              We do not guarantee that the website or tools will always meet
              every user's requirements, operate without interruption, support
              every file or browser, or produce error-free results in every
              situation.
            </p>

            <h2>19. Limitation of Liability</h2>

            <p>
              To the maximum extent permitted by applicable law, ImgControl and
              its operators shall not be liable for indirect, incidental,
              special, consequential or other losses arising from the use of or
              inability to use the website or its tools.
            </p>

            <p>
              This includes, where legally permitted, loss of data, business
              interruption, loss of files, lost profits or other indirect
              damages.
            </p>

            <p>
              Nothing in these Terms is intended to exclude or limit liability
              where such exclusion or limitation is not permitted by law.
            </p>

            <h2>20. User Accounts</h2>

            <p>
              ImgControl may currently provide many tools without requiring a
              user account. If account-based features are introduced in the
              future, additional terms or requirements may apply.
            </p>

            <h2>21. Privacy</h2>

            <p>
              Your use of ImgControl is also subject to our Privacy Policy,
              which explains how information may be handled in connection with
              the website.
            </p>

            <p>
              Please review the{" "}
              <Link href="/privacy">Privacy Policy</Link> for additional
              information.
            </p>

            <h2>22. Changes to These Terms</h2>

            <p>
              We may update these Terms of Use from time to time to reflect
              changes to the website, tools, business practices, technology or
              legal requirements.
            </p>

            <p>
              When changes are made, the updated Terms will be published on
              this page with a revised “Last updated” date.
            </p>

            <p>
              Your continued use of ImgControl after updated Terms are
              published means that you acknowledge the revised Terms to the
              extent permitted by applicable law.
            </p>

            <h2>23. Termination or Restriction of Access</h2>

            <p>
              We may suspend, restrict or terminate access to parts of the
              website when necessary to protect the service, users, security,
              infrastructure or legal interests of ImgControl.
            </p>

            <p>
              We may also restrict use where there is a reasonable basis to
              believe that a user has violated these Terms or misused the
              website.
            </p>

            <h2>24. Severability</h2>

            <p>
              If any provision of these Terms is found to be invalid or
              unenforceable under applicable law, the remaining provisions will
              continue to apply to the extent permitted by law.
            </p>

            <h2>25. Entire Agreement</h2>

            <p>
              These Terms, together with the Privacy Policy and any additional
              terms specifically applicable to particular features, constitute
              the principal terms governing your use of ImgControl.
            </p>

            <h2>26. Contact Us</h2>

            <p>
              If you have questions about these Terms of Use or the ImgControl
              website, please contact us:
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
                <Link href="/privacy">Privacy Policy</Link> and{" "}
                <Link href="/contact">Contact</Link> page.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}