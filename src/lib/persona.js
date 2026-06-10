export const EXP_SLABS = [
  { value: "0-2",  label: "0 – 2 years",  mid: 1 },
  { value: "2-5",  label: "2 – 5 years",  mid: 3.5 },
  { value: "5-8",  label: "5 – 8 years",  mid: 6.5 },
  { value: "8-12", label: "8 – 12 years", mid: 10 },
  { value: "12+",  label: "12+ years",    mid: 15 },
]

export const BUDGET_TILES = [
  { value: "0-2500",    label: "Up to ₹2,500",   max: 2500,  tag: "Free / micro" },
  { value: "2500-5000", label: "₹2,500 – ₹5,000", max: 5000, tag: "Essential" },
  { value: "5000-10000",label: "₹5k – ₹10k",      max: 10000, tag: "Professional" },
  { value: "10000-20000",label:"₹10k – ₹20k",      max: 20000, tag: "Advanced" },
  { value: "20000+",    label: "₹20,000+",         max: 99999, tag: "Premium" },
]

export const CTC_MAP = {
  "0-2": {
    private: { range: "₹3–6L",   line: "Your first salary is closer than you think", sub: "Entry-level roles are actively hiring freshers. This is your launchpad — and it only goes up." },
    govt:    { range: "₹4–8L",   line: "Government roles offer stability from day one", sub: "SSC CGL, IBPS, State PSCs — all reachable with the right prep." }
  },
  "2-5": {
    private: { range: "₹6–12L",  line: "You have real market value now — own it", sub: "2–5 years puts you in mid-level territory. A lateral move can mean a 40% salary jump." },
    govt:    { range: "₹6–10L",  line: "Your experience qualifies you for Group A roles", sub: "UPSC, RBI Grade B, SEBI — your profile is competitive at this level." }
  },
  "5-8": {
    private: { range: "₹12–22L", line: "Senior roles are calling — your experience is the asset", sub: "5–8 years commands leadership positions at top firms. Go get what you deserve." },
    govt:    { range: "₹10–18L", line: "You are eligible for senior government positions", sub: "IAS/IPS lateral entry, PSU leadership, NABARD — strong opportunities at your level." }
  },
  "8-12": {
    private: { range: "₹20–40L", line: "A decade of expertise — and yes, you deserve every rupee", sub: "8–12 years puts you in the Director / VP band. The market will pay for your leadership." },
    govt:    { range: "₹15–25L", line: "Senior executive roles in government are within reach", sub: "Joint Secretary, DGM-level PSU roles — your tenure makes you eligible for the top tier." }
  },
  "12+": {
    private: { range: "₹35–80L+", line: "You are not looking for a job — you are shaping an organisation", sub: "C-suite, VP, Partner tracks at top companies. Your next move defines a team, not just a career." },
    govt:    { range: "₹20–35L",  line: "Leadership at national scale is your next chapter", sub: "Secretary-level roles, PSU Board positions — your career is now about impact at scale." }
  },
}

export function getPersonaLine(expSlab) {
  const lines = {
    "0-2":  "Ready to launch your career? Every expert started exactly where you are.",
    "2-5":  "You are past the entry gate. Time to level up your market value.",
    "5-8":  "5+ years of experience is serious credibility. Let the market know it.",
    "8-12": "A decade of expertise. Time to lead, shape teams, and define where your field goes next.",
    "12+":  "You are not just building a career — you are defining what leadership looks like.",
  }
  return lines[expSlab] || lines["0-2"]
}

export function getBudgetMax(budgetTile) {
  const t = BUDGET_TILES.find(b => b.value === budgetTile)
  return t ? t.max : 2500
}
