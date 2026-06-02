import * as yup from 'yup';

export const planSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name too short')
    .required('Name is required'),

  price: yup
    .number()
    .min(1, 'Price must be greater than 0')
    .required('Price is required'),

  durationInDays: yup
    .number()
    .min(1, 'Duration must be at least 1 day')
    .required('Duration is required'),

  description: yup.string(),
});

export const assignSchema = yup.object({
  memberId: yup
    .number()
    .min(1, 'Select a member')
    .required('Member is required'),

  membershipPlanId: yup
    .number()
    .min(1, 'Select a plan')
    .required('Plan is required'),

  startDate: yup.string(),
});