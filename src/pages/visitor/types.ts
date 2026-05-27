export interface Benefit {
  label: string;
  amount: string;
  eligibility: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  tagline: string;
  coverage: string;
  color: string;
  popular?: boolean;
  benefits: Benefit[];
  commission: number;
}

export const packages: Package[] = [
  {
    id: "basic",
    name: "Basic Care",
    price: 698,
    tagline: "Individual protection, simple start",
    coverage: "Individual",
    color: "navy",
    benefits: [
      { label: "Accidental death", amount: "₱10,000 – ₱40,000", eligibility: "1–10 months" },
      { label: "Natural death", amount: "₱20,000 + ₱5,000 groceries", eligibility: "5 months" },
      { label: "Hospital cash", amount: "₱5,000 + ₱1,500/day", eligibility: "6 months" },
      { label: "Senior recognition", amount: "₱5,000 – ₱25,000", eligibility: "6 months" },
    ],
    commission: 224,
  },
  {
    id: "family",
    name: "Family Care",
    price: 1698,
    tagline: "Coverage for the whole household",
    coverage: "Family of 4",
    color: "green",
    popular: true,
    benefits: [
      { label: "Accidental death", amount: "₱10,000 – ₱40,000", eligibility: "1–10 months" },
      { label: "Natural death", amount: "₱20,000 + ₱5,000 groceries", eligibility: "5 months" },
      { label: "Hospital cash", amount: "₱5,000 + ₱1,500/day", eligibility: "6 months" },
      { label: "Senior recognition", amount: "₱5,000 – ₱25,000", eligibility: "6 months" },
      { label: "Calamity assistance", amount: "₱5,000", eligibility: "8 months" },
    ],
    commission: 544,
  },
  {
    id: "premium",
    name: "Premium Care",
    price: 4998,
    tagline: "Full benefits and leadership rewards",
    coverage: "Family of 5",
    color: "navy",
    benefits: [
      { label: "Accidental death", amount: "₱20,000 – ₱80,000", eligibility: "1–10 months" },
      { label: "Natural death", amount: "₱40,000 + ₱10,000 groceries", eligibility: "5 months" },
      { label: "Hospital cash", amount: "₱10,000 + ₱3,000/day", eligibility: "6 months" },
      { label: "Senior recognition", amount: "₱20,000 – ₱50,000", eligibility: "6 months" },
      { label: "Birthday care", amount: "₱5,000 + cake + tarpaulin", eligibility: "8 months" },
      { label: "Maternity assistance", amount: "₱10,000 – ₱20,000", eligibility: "8 months" },
      { label: "Calamity assistance", amount: "₱10,000", eligibility: "8 months" },
      { label: "Leadership bonus", amount: "Up to 6th rank", eligibility: "Active" },
    ],
    commission: 1600,
  },
];

export const peso = (n: number): string => "₱" + n.toLocaleString("en-PH");