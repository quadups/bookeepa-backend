import {
  EntitlementEnforcement,
  EntitlementPeriod,
  PlanCode,
} from '@prisma/client';
import { FEATURE_CODES, FeatureCode } from './feature-codes';

export interface PlanEntitlementDefinition {
  featureCode: FeatureCode;
  enabled: boolean;
  limit: number | null;
  period: EntitlementPeriod | null;
  enforcement: EntitlementEnforcement;
}

type EntitlementByFeature = Record<FeatureCode, PlanEntitlementDefinition>;

function entitlement(
  featureCode: FeatureCode,
  options: Omit<PlanEntitlementDefinition, 'featureCode'>,
): PlanEntitlementDefinition {
  return { featureCode, ...options };
}

export const PLAN_ENTITLEMENTS: Record<PlanCode, EntitlementByFeature> = {
  [PlanCode.STARTER]: {
    [FEATURE_CODES.CUSTOMERS]: entitlement(FEATURE_CODES.CUSTOMERS, {
      enabled: true,
      limit: 100,
      period: EntitlementPeriod.LIFETIME,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.TRANSACTIONS]: entitlement(FEATURE_CODES.TRANSACTIONS, {
      enabled: true,
      limit: 300,
      period: EntitlementPeriod.MONTHLY,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.INVOICES]: entitlement(FEATURE_CODES.INVOICES, {
      enabled: true,
      limit: 30,
      period: EntitlementPeriod.MONTHLY,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.MANUAL_REMINDERS]: entitlement(
      FEATURE_CODES.MANUAL_REMINDERS,
      {
        enabled: true,
        limit: 50,
        period: EntitlementPeriod.MONTHLY,
        enforcement: EntitlementEnforcement.BLOCK,
      },
    ),
    [FEATURE_CODES.TEAM_MEMBERS]: entitlement(FEATURE_CODES.TEAM_MEMBERS, {
      enabled: true,
      limit: 1,
      period: EntitlementPeriod.LIFETIME,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.PAYMENT_LINKS]: entitlement(FEATURE_CODES.PAYMENT_LINKS, {
      enabled: false,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.WHATSAPP_AUTOMATION]: entitlement(
      FEATURE_CODES.WHATSAPP_AUTOMATION,
      {
        enabled: false,
        limit: null,
        period: null,
        enforcement: EntitlementEnforcement.BLOCK,
      },
    ),
    [FEATURE_CODES.AI_INSIGHTS]: entitlement(FEATURE_CODES.AI_INSIGHTS, {
      enabled: false,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
  },
  [PlanCode.GROWTH]: {
    [FEATURE_CODES.CUSTOMERS]: entitlement(FEATURE_CODES.CUSTOMERS, {
      enabled: true,
      limit: 500,
      period: EntitlementPeriod.LIFETIME,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.TRANSACTIONS]: entitlement(FEATURE_CODES.TRANSACTIONS, {
      enabled: true,
      limit: 2000,
      period: EntitlementPeriod.MONTHLY,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.INVOICES]: entitlement(FEATURE_CODES.INVOICES, {
      enabled: true,
      limit: 200,
      period: EntitlementPeriod.MONTHLY,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.MANUAL_REMINDERS]: entitlement(
      FEATURE_CODES.MANUAL_REMINDERS,
      {
        enabled: true,
        limit: 500,
        period: EntitlementPeriod.MONTHLY,
        enforcement: EntitlementEnforcement.BLOCK,
      },
    ),
    [FEATURE_CODES.TEAM_MEMBERS]: entitlement(FEATURE_CODES.TEAM_MEMBERS, {
      enabled: true,
      limit: 3,
      period: EntitlementPeriod.LIFETIME,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.PAYMENT_LINKS]: entitlement(FEATURE_CODES.PAYMENT_LINKS, {
      enabled: true,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.WHATSAPP_AUTOMATION]: entitlement(
      FEATURE_CODES.WHATSAPP_AUTOMATION,
      {
        enabled: false,
        limit: null,
        period: null,
        enforcement: EntitlementEnforcement.BLOCK,
      },
    ),
    [FEATURE_CODES.AI_INSIGHTS]: entitlement(FEATURE_CODES.AI_INSIGHTS, {
      enabled: false,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
  },
  [PlanCode.PRO]: {
    [FEATURE_CODES.CUSTOMERS]: entitlement(FEATURE_CODES.CUSTOMERS, {
      enabled: true,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.TRANSACTIONS]: entitlement(FEATURE_CODES.TRANSACTIONS, {
      enabled: true,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.INVOICES]: entitlement(FEATURE_CODES.INVOICES, {
      enabled: true,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.MANUAL_REMINDERS]: entitlement(
      FEATURE_CODES.MANUAL_REMINDERS,
      {
        enabled: true,
        limit: null,
        period: null,
        enforcement: EntitlementEnforcement.BLOCK,
      },
    ),
    [FEATURE_CODES.TEAM_MEMBERS]: entitlement(FEATURE_CODES.TEAM_MEMBERS, {
      enabled: true,
      limit: 10,
      period: EntitlementPeriod.LIFETIME,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.PAYMENT_LINKS]: entitlement(FEATURE_CODES.PAYMENT_LINKS, {
      enabled: true,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
    [FEATURE_CODES.WHATSAPP_AUTOMATION]: entitlement(
      FEATURE_CODES.WHATSAPP_AUTOMATION,
      {
        enabled: true,
        limit: null,
        period: null,
        enforcement: EntitlementEnforcement.BLOCK,
      },
    ),
    [FEATURE_CODES.AI_INSIGHTS]: entitlement(FEATURE_CODES.AI_INSIGHTS, {
      enabled: true,
      limit: null,
      period: null,
      enforcement: EntitlementEnforcement.BLOCK,
    }),
  },
};
