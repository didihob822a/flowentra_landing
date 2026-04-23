import { forwardRef } from "react";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import TN from "country-flag-icons/react/3x2/TN";
import DE from "country-flag-icons/react/3x2/DE";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flags: Record<string, any> = { FR, GB, TN, DE };

const langToFlag: Record<string, string> = {
  en: "GB",
  fr: "FR",
  de: "DE",
  ar: "TN",
};

interface FlagIconProps {
  country: string;
  className?: string;
}

const FlagIcon = forwardRef<HTMLSpanElement, FlagIconProps>(
  ({ country, className = "" }, ref) => {
    const countryCode = langToFlag[country] || country;
    const Flag = flags[countryCode];
    if (!Flag) return null;
    return (
      <span ref={ref} className={`inline-flex ${className}`}>
        <Flag className="w-full h-full rounded-sm" />
      </span>
    );
  }
);

FlagIcon.displayName = "FlagIcon";

export default FlagIcon;
