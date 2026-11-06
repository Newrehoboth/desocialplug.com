import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

const PrivacyPolicy = () => {
  return (
      <>
          <Header/>
       <div className="bg-background min-h-screen py-12 px-4 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 border-b pb-4">
          Privacy Policy
        </h1>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          {/* INTERPRETATION AND DEFINITIONS */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Interpretation and Definitions
            </h2>

            <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
              Interpretation
            </h3>
            <p>
              The words of which the initial letter is capitalized have meanings defined under the
              following conditions. The following definitions shall have the same meaning regardless
              of whether they appear in singular or in plural.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">
              Definitions
            </h3>
            <p>For the purposes of this Privacy Policy:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>
                <strong>Account</strong> means a unique account created for You to access our
                Service or parts of our Service.
              </li>
              <li>
                <strong>Affiliate</strong> means an entity that controls, is controlled by or is
                under common control with a party, where "control" means ownership of 50% or more of
                the shares, equity interest or other securities entitled to vote for election of
                directors or other managing authority.
              </li>
              <li>
                <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our"
                in this Agreement) refers to DE’SOCIALPLUG.
              </li>
              <li>
                <strong>Cookies</strong> are small files that are placed on Your computer, mobile
                device or any other device by a website, containing the details of Your browsing
                history on that website among its many uses.
              </li>
              <li>
                <strong>Country</strong> refers to: Nigeria
              </li>
              <li>
                <strong>Device</strong> means any device that can access the Service such as a
                computer, a cellphone or a digital tablet.
              </li>
              <li>
                <strong>Personal Data</strong> is any information that relates to an identified or
                identifiable individual.
              </li>
              <li>
                <strong>Service</strong> refers to the Website.
              </li>
              <li>
                <strong>Service Provider</strong> means any natural or legal person who processes
                the data on behalf of the Company.
              </li>
              <li>
                <strong>Usage Data</strong> refers to data collected automatically, either generated
                by the use of the Service or from the Service infrastructure itself.
              </li>
              <li>
                <strong>Website</strong> refers to DE’SOCIALPLUG, accessible from{" "}
                <a
                  href="https://desocialplug.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://desocialplug.com
                </a>
              </li>
              <li>
                <strong>You</strong> means the individual accessing or using the Service, or the
                company, or other legal entity on behalf of which such individual is accessing or
                using the Service, as applicable.
              </li>
            </ul>
          </section>

          {/* COLLECTING AND USING YOUR PERSONAL DATA */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Collecting and Using Your Personal Data
            </h2>

            <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
              Types of Data Collected
            </h3>

            <h4 className="text-lg font-semibold mt-2 mb-1">Personal Data</h4>
            <p>
              While using Our Service, We may ask You to provide Us with certain personally
              identifiable information that can be used to contact or identify You. Personally
              identifiable information may include, but is not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Usage Data</li>
            </ul>

            <h4 className="text-lg font-semibold mt-4 mb-1">Usage Data</h4>
            <p>
              Usage Data is collected automatically when using the Service. Usage Data may include
              information such as Your Device's IP address, browser type, version, pages visited,
              time and date of visit, time spent, and other diagnostic data.
            </p>

            <p className="mt-3">
              When You access the Service by or through a mobile device, We may collect information
              including, but not limited to, the type of mobile device You use, Your mobile device
              ID, IP address, operating system, browser type, and other diagnostic data.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">
              Tracking Technologies and Cookies
            </h3>
            <p>
              We use Cookies and similar tracking technologies to track activity on Our Service and
              store certain information. Tracking technologies include beacons, tags, and scripts to
              improve and analyze Our Service.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Cookies or Browser Cookies:</strong> A small file placed on Your Device. You
                can instruct Your browser to refuse all Cookies or to indicate when one is sent.
              </li>
              <li>
                <strong>Web Beacons:</strong> Small electronic files that help us count users who
                have visited pages or opened emails.
              </li>
            </ul>

            <p className="mt-4">
              Cookies can be “Persistent” or “Session” Cookies. Persistent Cookies remain when You go
              offline, while Session Cookies are deleted once You close your browser.
            </p>
          </section>

          {/* USAGE OF DATA */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Use of Your Personal Data
            </h2>
            <p>
              The Company may use Personal Data for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>To provide and maintain our Service.</li>
              <li>To manage Your Account and registration.</li>
              <li>For the performance of a contract.</li>
              <li>To contact You via email, phone, or other means.</li>
              <li>To send news, offers, and general information about our services.</li>
              <li>To manage Your requests and inquiries.</li>
              <li>
                For business transfers, mergers, or acquisitions involving Company assets.
              </li>
              <li>For analytics and service improvement.</li>
            </ul>
          </section>

          {/* RETENTION & TRANSFER */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Retention and Transfer of Your Personal Data
            </h2>
            <p>
              The Company will retain Your Personal Data only for as long as necessary to comply
              with legal obligations, resolve disputes, and enforce agreements.
            </p>
            <p className="mt-3">
              Your data may be transferred to and maintained on computers outside of Your country.
              By submitting information, You consent to that transfer under secure conditions.
            </p>
          </section>

          {/* DELETE */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Delete Your Personal Data
            </h2>
            <p>
              You have the right to delete or request deletion of Your Personal Data. You may update
              or delete Your information at any time by signing into Your Account or contacting Us.
            </p>
          </section>

          {/* DISCLOSURE */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Disclosure of Your Personal Data
            </h2>
            <p>
              Your Personal Data may be disclosed if required by law, during a merger, or to protect
              the Company’s rights, property, or safety.
            </p>
          </section>

          {/* SECURITY */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Security of Your Personal Data
            </h2>
            <p>
              We use commercially acceptable means to protect Your data, but no online transmission
              or storage is 100% secure.
            </p>
          </section>

          {/* CHILDREN */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Children’s Privacy
            </h2>
            <p>
              We do not knowingly collect data from anyone under 13. If we learn that we have done
              so, we will promptly remove it from our servers.
            </p>
          </section>

          {/* LINKS */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Links to Other Websites
            </h2>
            <p>
              Our Service may contain links to other websites not operated by Us. We are not
              responsible for the content or privacy practices of third-party sites.
            </p>
          </section>

          {/* CHANGES */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes become effective once
              posted on this page.
            </p>
          </section>

          <p className="text-sm text-muted-foreground border-t pt-6 mt-8 text-center">
            © {new Date().getFullYear()} DE’SOCIALPLUG. All rights reserved.
          </p>
        </div>
      </div>
          </div>
          <Footer/>
      </>
  );
};

export default PrivacyPolicy;
