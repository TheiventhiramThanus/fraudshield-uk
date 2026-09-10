export const fraudTrendData = [
  { month: "Jan", reports: 4821, losses: 2.1 },
  { month: "Feb", reports: 5103, losses: 2.4 },
  { month: "Mar", reports: 6230, losses: 3.1 },
  { month: "Apr", reports: 5890, losses: 2.8 },
  { month: "May", reports: 7120, losses: 3.6 },
  { month: "Jun", reports: 8340, losses: 4.2 },
  { month: "Jul", reports: 7890, losses: 3.9 },
  { month: "Aug", reports: 9210, losses: 4.8 },
  { month: "Sep", reports: 8670, losses: 4.3 },
  { month: "Oct", reports: 10120, losses: 5.2 },
  { month: "Nov", reports: 11340, losses: 5.9 },
  { month: "Dec", reports: 9870, losses: 5.1 },
];

export const categoryData = [
  { name: "Phishing", value: 28, fill: "#1d4ed8" },
  { name: "Bank Impersonation", value: 21, fill: "#7c3aed" },
  { name: "Investment Scam", value: 17, fill: "#db2777" },
  { name: "Delivery Scam", value: 12, fill: "#059669" },
  { name: "Gov. Impersonation", value: 9, fill: "#d97706" },
  { name: "Tech Support", value: 7, fill: "#0891b2" },
  { name: "Other", value: 6, fill: "#64748b" },
];

export const regionData = [
  { region: "London", reports: 18420, loss: 9.2 },
  { region: "South East", reports: 12310, loss: 6.1 },
  { region: "North West", reports: 10890, loss: 5.4 },
  { region: "West Midlands", reports: 9230, loss: 4.6 },
  { region: "Yorkshire", reports: 8760, loss: 4.3 },
  { region: "East of England", reports: 7890, loss: 3.9 },
  { region: "South West", reports: 6540, loss: 3.2 },
  { region: "East Midlands", reports: 5890, loss: 2.9 },
  { region: "North East", reports: 3210, loss: 1.6 },
  { region: "Scotland", reports: 7120, loss: 3.5 },
  { region: "Wales", reports: 4230, loss: 2.1 },
  { region: "N. Ireland", reports: 2890, loss: 1.4 },
];

export const modelMetrics = [
  {
    model: "Logistic Regression",
    accuracy: 0.876,
    precision: 0.891,
    recall: 0.854,
    f1: 0.872,
    rocAuc: 0.934,
    active: false,
  },
  {
    model: "Multinomial Naive Bayes",
    accuracy: 0.843,
    precision: 0.858,
    recall: 0.821,
    f1: 0.839,
    rocAuc: 0.901,
    active: false,
  },
  {
    model: "Random Forest",
    accuracy: 0.912,
    precision: 0.924,
    recall: 0.897,
    f1: 0.910,
    rocAuc: 0.961,
    active: true,
  },
];

export const confusionMatrix = {
  truePositive: 1823,
  falsePositive: 142,
  falseNegative: 189,
  trueNegative: 2871,
};

export const publicStats = {
  totalReports: 94230,
  estimatedLosses: 47.2,
  avgLossPerVictim: 1840,
  reportedThisMonth: 9870,
  dataSource: "Action Fraud UK (2023–2024)",
  sourceUrl: "https://www.actionfraud.police.uk/statistics",
  datasetDate: "2024-03-31",
  lastUpdated: "2024-09-01",
};
