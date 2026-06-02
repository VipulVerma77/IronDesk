import * as yup from 'yup';

export const memberSchema = yup.object({
  fullName: yup
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full name is required'),

  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
    .required('Phone is required'),

  address: yup
    .string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),

  joinDate: yup
    .string()
    .required('Join date is required'),
});