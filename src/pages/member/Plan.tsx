import React from "react";
import PackageComparison from "../../components/PackageComparison";
import UpgradeCard from "../../components/UpgradeCard";
import type { Member } from "../../utils/types";

interface Props {
    /** Member's current package, e.g. "Basic" / "Family" / "Premium". */
    packageName: string;
    member: Member;
}

export const MemberPlan: React.FC<Props> = ({ packageName, member }) => (
    <div className="space-y-6">
        <div>
            <h1 className="font-display text-fsc-navy text-3xl">Plans</h1>
            <p className="text-fsc-stone mt-1 text-sm">Compare tiers and upgrade your coverage.</p>
        </div>
        <UpgradeCard member={member} />
        <PackageComparison currentPackage={packageName} variant="page" />
    </div>
);
