"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import PrivacyPolicyPage from "./PrivacyPolicy";
import TermsOfServicePage from "./TermsOfService";

type FooterProps = {
  isLoggedIn: boolean;
}

export default function Footer({ isLoggedIn }: FooterProps) {
  const [showPolicy, setShowPolicy] = useState<boolean>(false);
  const [showTOS, setShowTOS] = useState<boolean>(false);

  return (
    <footer className="bg-transparent text-gray-700 dark:text-gray-300 midnight:text-gray-300 flex items-center justify-center">
      {showPolicy && <PrivacyPolicyPage handleClose={() => setShowPolicy(false)} />}
      {showTOS && <TermsOfServicePage handleClose={() => setShowTOS(false)} />}

      <div className="max-w-7xl mx-auto px-3 pt-6 pb-28 text-center w-full">
        <hr className="border-gray-200 dark:border-gray-800 midnight:border-gray-800 w-11/12 mx-auto mb-5" />

        <p className="text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-pink-500 to-blue-400 bg-clip-text text-transparent mb-2">
          EZVTOP — The Premium VTOP Portal
        </p>

        <span className="text-xs text-gray-400 dark:text-gray-500 midnight:text-gray-500 block">
          &copy; {new Date().getFullYear()} EZVTOP. All rights reserved.
        </span>

        <div className="mt-2 flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            className="h-6 underline text-xs text-gray-400 dark:text-gray-500 px-2"
            onClick={() => setShowPolicy(true)}
          >
            Privacy Policy
          </Button>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <Button
            variant="ghost"
            className="h-6 underline text-xs text-gray-400 dark:text-gray-500 px-2"
            onClick={() => setShowTOS(true)}
          >
            Terms of Service
          </Button>
        </div>
      </div>
    </footer>
  );
}
