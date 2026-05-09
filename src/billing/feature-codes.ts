export const FEATURE_CODES = {
  CUSTOMERS: 'CUSTOMERS',
  TRANSACTIONS: 'TRANSACTIONS',
  INVOICES: 'INVOICES',
  MANUAL_REMINDERS: 'MANUAL_REMINDERS',
  TEAM_MEMBERS: 'TEAM_MEMBERS',
  PAYMENT_LINKS: 'PAYMENT_LINKS',
  WHATSAPP_AUTOMATION: 'WHATSAPP_AUTOMATION',
  AI_INSIGHTS: 'AI_INSIGHTS',
} as const;

export type FeatureCode = (typeof FEATURE_CODES)[keyof typeof FEATURE_CODES];

export const FEATURE_CATALOG: Array<{
  code: FeatureCode;
  name: string;
  description: string;
}> = [
  {
    code: FEATURE_CODES.CUSTOMERS,
    name: 'Customers',
    description: 'Customer and debtor records managed by a business.',
  },
  {
    code: FEATURE_CODES.TRANSACTIONS,
    name: 'Transactions',
    description: 'Income and expense records created in a billing period.',
  },
  {
    code: FEATURE_CODES.INVOICES,
    name: 'Invoices',
    description: 'Invoices created for customers in a billing period.',
  },
  {
    code: FEATURE_CODES.MANUAL_REMINDERS,
    name: 'Manual reminders',
    description: 'Reminder messages logged manually from the app.',
  },
  {
    code: FEATURE_CODES.TEAM_MEMBERS,
    name: 'Team members',
    description: 'Users who can collaborate on one business.',
  },
  {
    code: FEATURE_CODES.PAYMENT_LINKS,
    name: 'Payment links',
    description: 'External processor payment links for invoices.',
  },
  {
    code: FEATURE_CODES.WHATSAPP_AUTOMATION,
    name: 'WhatsApp automation',
    description: 'Automated WhatsApp reminders and notifications.',
  },
  {
    code: FEATURE_CODES.AI_INSIGHTS,
    name: 'AI insights',
    description: 'AI-generated analytics and recommendations.',
  },
];
