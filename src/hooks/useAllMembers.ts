import { useEffect, useState } from "react";
import { getAllMembers } from "../firebase/admin";
import type { Member } from "../utils/types";

export interface MemberWithSponsor extends Member {
    sponsorName: string;
}

export const useAllMembers = () => {
    const [members, setMembers] = useState<MemberWithSponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);

            const raw = await getAllMembers();

            // Sponsors are already in `raw` (we fetched every member) — build the
            // name map in memory instead of firing one getDoc per sponsor (N+1).
            const sponsorMap: Record<string, string> = {};
            for (const m of raw as any[]) {
                sponsorMap[m.uid] = `${m.firstName} ${m.lastName}`;
            }

            const withSponsors: MemberWithSponsor[] = raw.map((m: any) => ({
                ...m,
                sponsorName: m.referredBy ? (sponsorMap[m.referredBy] ?? "—") : "—",
            }));

            if (!cancelled) {
                setMembers(withSponsors);
                setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [tick]);

    const refetch = () => setTick((t) => t + 1);

    return { members, loading, refetch };
};

export default useAllMembers;
