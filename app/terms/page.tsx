import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

export default function TermsOfUse() {
  return (
      <>
          <Header/>
       <div className="bg-background min-h-screen py-10 px-4 md:px-10 lg:px-20 text-foreground">
      <div className="max-w-4xl mx-auto bg-card border border-border shadow-lg rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-6">
          DE’SOCIALPLUG – Terms of Use
        </h1>
        <p className="text-center text-muted-foreground mb-8 italic">
          Please read carefully before accessing or using our services.
        </p>

        <section className="space-y-6 leading-relaxed">
          <p>
            Make sure to use{" "}
            <span className="font-semibold text-blue-600">
              m.facebook.com
            </span>{" "}
            for first login for Facebook. Request{" "}
            <span className="font-semibold">desktop mode</span> for better usage
            on Chrome, Firefox, or Brave browser, and make sure to clear your
            browser history. Do not use a PC for the first login — we will not
            replace any account that goes on checkpoint due to failure to follow
            these rules.
          </p>

          <div className="bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-md">
            <p className="font-semibold text-blue-900 dark:text-blue-400 uppercase mb-2">
              Kindly follow the above rules
            </p>
            <p>
              Failure to do so may result in your account being unrecoverable,
              and we will not replace certain errors caused by disobedience.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10">
            Most Recommended VPN for Facebook
          </h2>
          <ul className="list-disc list-inside space-y-2 mt-2 text-muted-foreground">
            <li>SURFSHARK VPN</li>
            <li>HMA VPN</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10">
            Account Unlock Policy
          </h2>
          <p>
            Customers must unlock a locked account linked to an email before we
            can assist with unlocking. If the account is not linked to an email,
            we will replace it.
          </p>
          <p>
            We cannot replace an account because the customer cannot change the
            account’s date of birth or name. Replacements are only for valid
            issues — if an account is replaced, customers often take it back in
            the future, causing unnecessary losses.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10">
            Marketplace Disclaimer
          </h2>
          <p>
            We do not replace damaged marketplace features on any Facebook
            account. However, 90% of the time, the marketplace works perfectly.
            If you wish to replace a damaged marketplace account, consider
            purchasing an EU or USA account instead.
          </p>

          <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-md mt-8">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 uppercase mb-2">
              Important Notice
            </h3>
            <p className="text-foreground">
              Do not use Safari browser to log in to any account purchased on
              this site. Never use the Facebook app for your first login.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10">
            Validity and Warranty
          </h2>
          <p>
            The full validity of each account lasts within{" "}
            <span className="font-semibold">24 hours after purchase</span>,
            provided that no rule was broken. We do not replace an account
            because its date of birth cannot be changed.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10">Final Notice</h2>
          <p>
            You are required to use{" "}
            <span className="font-semibold text-blue-600">
              m.facebook.com
            </span>{" "}
            for the first login of any Facebook account before logging in via
            the app. We will not provide warranty or replacement for any account
            that gets checkpointed or locked due to violation of these rules.
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
