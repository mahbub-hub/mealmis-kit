import { z } from 'zod';

export const resultSchema = z.object({
  month: z.string().min(1, "Month is required"),
  programme: z.enum(['SELP', 'TBCP', 'MEP', 'WASH', 'Migration', 'BEP', 'BHP', 'UPGP', 'UDP', 'DRMP', 'SDP', 'MF', 'IDP', 'CCP']),
  district: z.string().min(1, "District is required"),
  upazilla: z.string().min(1, "Upazilla is required"),
  union: z.string().min(1, "Union is required"),
  branchId: z.string().min(1, "Please select a branch"),
  activityId: z.string().min(1, "Please select an activity"),
  male: z.number().min(0).default(0),
  female: z.number().min(0).default(0),
  others: z.number().min(0).default(0),
  disableMale: z.number().min(0).default(0),
  disableFemale: z.number().min(0).default(0),
  disableOthers: z.number().min(0).default(0),
  totalAchievements: z.number().min(0).default(0),
});