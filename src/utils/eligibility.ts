export const ELIGIBILITY_MILESTONES = [
    { label: "Accidental Death Assistance", months: 1 },
    { label: "Natural Death (₱20,000 tier)", months: 5 },
    { label: "Hospital Cash Assistance", months: 6 },
    { label: "Birthday Care Gift", months: 8 },
    { label: "Natural/Accidental (₱40,000 tier)", months: 10 },
];

export const getEligibilityTimeline = (dateCreated: any) => {
    if (!dateCreated) return ELIGIBILITY_MILESTONES.map((m) => ({ ...m, unlocked: false }));

    const joinDate: Date = dateCreated.toDate?.() ?? new Date(dateCreated);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());

    return ELIGIBILITY_MILESTONES.map((m) => ({
        ...m,
        unlocked: monthsElapsed >= m.months,
    }));
};
