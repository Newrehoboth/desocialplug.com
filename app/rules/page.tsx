import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

export default function Rules() {
  return (
      <>
           <Header />
       <div className="bg-background min-h-screen py-10 px-4 md:px-10 lg:px-20 text-foreground">
      <div className="max-w-4xl mx-auto bg-card border border-border shadow-lg rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-6">
          DE’SOCIALPLUG – Rules and Regulations
        </h1>
        <p className="text-center text-muted-foreground mb-8 italic">
          Please read and follow these rules carefully to ensure a smooth experience.
        </p>

        <section className="space-y-6 leading-relaxed text-muted-foreground">
          <p className="text-foreground">
            The following rules are established to maintain order, fairness, and
            quality service for all customers using our platform. Violation of
            any of these may result in denial of service or account replacement
            eligibility.
          </p>

          <hr className="border-gray-200 my-6" />

          <ul className="list-decimal list-inside space-y-4">
            <li>
              Always secure your accounts shortly after logging in to ensure their safety.
            </li>
            <li>
              Accounts cannot be replaced once the password has been changed.
            </li>
            <li>
              We provide replacements for faulty accounts, but only if the issue
              originates from our end and not due to user actions or misuse.
            </li>
            <li>
              These regulations are subject to change at any time without prior notice.
            </li>
            <li>
              Use of obscene or disrespectful language toward our administrators
              may result in refusal of service.
            </li>
            <li>
              Ignorance of these rules does not exempt users from accountability.
            </li>
            <li>
              Our technical support team is available <strong>24/7</strong> to
              address any issues or concerns.
            </li>
            <li>
              All accounts undergo thorough checks using our private verification
              system and mobile proxy to ensure <strong>100% validity</strong>.
            </li>
            <li>
              Accounts cannot be refunded but may be replaced if found faulty,
              provided all other guidelines are followed.
            </li>
            <li>
              The store holds no responsibility for any account activity after
              purchase. The duration of an account’s functionality depends on
              its usage. We do not offer replacements or refunds for suspended,
              disabled, or logged-out accounts after successful login.
              <br />
              <br />
              Purchase an account only if you fully understand how to use it.
              Refunds will <strong>not</strong> be issued due to lack of
              knowledge. However, we are happy to provide helpful tips and
              guidance to ensure a smooth experience.
            </li>
            <li>
              The store does <strong>not</strong> provide training or advice on
              the use of accounts. We are responsible only for supplying valid
              accounts, not for teaching users how to operate them. For
              questions regarding usage, please consult other experts or trusted
              resources in this field.
            </li>
            <li>
              If you intend to use purchased accounts long-term, you must
              regularly change passwords and ensure your own security measures.
              This protects your interests and prevents unauthorized access.
              <br />
              <br />
              The store is not responsible for security issues that arise after
              purchase.
            </li>
            <li>
              Replacement requests must be made within <strong>24 hours</strong>{" "}
              of purchase.
            </li>
            <li>
              We <strong>will not replace</strong> accounts when users cannot
              change the name, date of birth, or when the marketplace is not
              functioning.
            </li>
          </ul>

          <hr className="border-gray-200 my-6" />

          <div className="bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
              Important Reminder
            </h3>
            <p className="text-foreground">
              Please take the time to review and understand these rules before
              making any purchase. Adherence ensures fair service, better
              communication, and smoother transactions for everyone involved.
            </p>
          </div>

          <div className="border-t pt-6 mt-10 text-sm text-muted-foreground text-center">
            <p>© {new Date().getFullYear()} DE’SOCIALPLUG. All Rights Reserved.</p>
          </div>
        </section>
      </div>
          </div>
            <Footer />
      </>
  );
}


 