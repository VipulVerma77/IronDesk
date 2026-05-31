import * as yup from 'yup';

export const registerGymSchema = yup.object({
  gymName: yup
    .string()
    .min(3, 'Gym name must be at least 3 characters')
    .required('Gym name is required'),

  gymEmail: yup
    .string()
    .email('Enter a valid email')
    .required('Gym email is required'),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
    .required('Phone is required'),

  address: yup
    .string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),

  description: yup
    .string()
    .max(200, 'Description must be under 200 characters'),

  adminName: yup
    .string()
    .min(3, 'Admin name must be at least 3 characters')
    .required('Admin name is required'),

  adminEmail: yup
    .string()
    .email('Enter a valid email')
    .required('Admin email is required'),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});