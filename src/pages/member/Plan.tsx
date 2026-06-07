import React from "react";
import PackageComparison from "../../components/PackageComparison";

interface Props {
    /** Member's current package, e.g. "Basic" / "Family" / "Premium". */
    packageName: string;
}

export const MemberPlan: React.FC<Props> = ({ packageName }) => (
    <div className="space-y-6">
        <div>
            <h1 className="font-display text-fsc-navy text-3xl">Plans</h1>
            <p className="text-fsc-stone mt-1 text-sm">Compare tiers and upgrade your coverage.</p>
        </div>
        <PackageComparison currentPackage={packageName} variant="page" />
    </div>
);
