import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

export default function TermsAndConditions() {
  return (
      <>
          <Header/>
       <div className="bg-background min-h-screen py-10 px-4 md:px-10 lg:px-20 text-foreground">
      <div className="max-w-4xl mx-auto bg-card border border-border shadow-lg rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-6">
          DE’SOCIALPLUG – Terms and Conditions
        </h1>
        <p className="text-center text-muted-foreground mb-8 italic">
          Please read carefully before accessing or using our services.
        </p>

        <section className="space-y-8 leading-relaxed">
          {/* Intro */}
          <p>
            Welcome to <span className="font-semibold">De’socialPlug</span>. By
            accessing or using our services, you agree to the following terms
            and conditions. Please read this carefully before proceeding.
          </p>

          <hr className="border-gray-200 my-6" />

          {/* Section 1 */}
          <h2 className="text-2xl font-bold text-foreground">1. User Responsibility</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              All accounts sold by De’socialPlug are provided{" "}
              <span className="italic">“as-is”</span> and without warranty.
            </li>
            <li>
              By purchasing or using any accounts from De’socialPlug, you
              acknowledge that you are solely responsible for how you use them.
            </li>
            <li>
              You agree to comply with all applicable laws, regulations, and
              platform terms of service associated with the accounts.
            </li>
          </ul>

          <hr className="border-gray-200 my-6" />

          {/* Section 2 */}
          <h2 className="text-2xl font-bold text-foreground">2. No Illegal Activity</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              De’socialPlug does not condone, encourage, or participate in any
              illegal activities, including but not limited to hacking,
              spamming, or unauthorized access to accounts.
            </li>
            <li>
              Any actions taken by users with the accounts purchased from
              De’socialPlug are the sole responsibility of the user.
            </li>
            <li>
              We do not guarantee secondary sales, and accounts sold here are
              not to be used for illegal purposes. We are not responsible for
              any problems caused by such misuse.
            </li>
          </ul>

          <hr className="border-gray-200 my-6" />

          {/* Section 3 */}
          <h2 className="text-2xl font-bold text-foreground">3. No Warranty or Guarantee</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              De’socialPlug makes no guarantees regarding the functionality,
              longevity, or legitimacy of the accounts sold.
            </li>
            <li>
              Users assume all risks associated with the use of these accounts.
            </li>
          </ul>

          <hr className="border-gray-200 my-6" />

          {/* Section 4 */}
          <h2 className="text-2xl font-bold text-foreground">4. Indemnification</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              By using our services, you agree to indemnify and hold harmless
              De’socialPlug, its owners, employees, and affiliates from any
              claims, damages, or legal actions arising from your use of the
              accounts.
            </li>
          </ul>

          <hr className="border-gray-200 my-6" />

          {/* Section 5 */}
          <h2 className="text-2xl font-bold text-foreground">5. Compliance with Laws</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              It is the user’s responsibility to ensure that their use of any
              accounts purchased from De’socialPlug complies with all local,
              state, federal, and international laws.
            </li>
          </ul>

          <hr className="border-gray-200 my-6" />

          {/* Ethics Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              Responsible Use Reminder
            </h3>
            <p className="text-foreground">
              We urge our users to use our products responsibly and ethically.
              Do not engage in activities that may harm others or violate the
              law — including but not limited to bullying, spamming, making
              threats, fraud, extortion, or data theft.
            </p>
          </div>

          <p>
            As a reputable marketplace, we strictly prohibit scams or fraudulent
            behavior. We aim to foster a safe online environment and expect all
            users to uphold these values.
          </p>

          <p>
            By maintaining ethical standards and integrity, we can ensure a
            positive experience for everyone in our community.
          </p>

          <hr className="border-gray-200 my-6" />

          {/* Acknowledgment */}
          <h2 className="text-2xl font-bold text-foreground">Acknowledgment</h2>
          <p>
            By proceeding with a purchase or using our services, you acknowledge
            that you have read, understood, and agreed to this disclaimer. If
            you do not agree, you must refrain from using our services
            immediately.
          </p>

          <div className="border-t pt-6 mt-10 text-sm text-muted-foreground text-center">
            <p>
              © {new Date().getFullYear()} DE’SOCIALPLUG. All Rights Reserved.
            </p>
          </div>
        </section>
      </div>
          </div>
          <Footer/>
      </>
  );
}
