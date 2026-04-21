import * as yup from 'yup';

const phoneRegex = /^[0-9+\s\-()]{10,15}$/;

export const admissionRegistrationSchema = yup.object().shape({
  centerName: yup.string().required('Center Name is required').trim(),
  licenseeName: yup.string().required('Licensee Name is required').trim(),
  licenseeEmail: yup
    .string()
    .email('Please enter a valid email address')
    .required('Licensee Email is required')
    .lowercase(),
  licenseeContactNumber: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .required('Licensee Contact Number is required'),

  contactPersonName: yup.string().required('Contact Person Name is required'),
  contactPersonPhone: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .required('Contact Person Phone Number is required'),
  contactPersonEmail: yup
    .string()
    .email('Please enter a valid email address')
    .required('Contact Person Email is required'),

  localRefName1: yup.string().optional(),
  localRefMobile1: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .optional(),
  
  localRefName2: yup.string().optional(),
  localRefMobile2: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .optional(),

  centerAddress: yup.string().required('Center Address is required'),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  pincode: yup.string().required('Pincode is required'),

  // Files validation - required
  licenseePhoto: yup
    .mixed()
    .test('required', 'Licensee Photo is required', (value) => value && value.length > 0),
  licenseeAadharCard: yup
    .mixed()
    .test('required', 'Licensee Aadhar Card is required', (value) => value && value.length > 0),
  businessLicense: yup
    .mixed()
    .test('required', 'Business License is required', (value) => value && value.length > 0),
  ownershipRentalAgreement: yup
    .mixed()
    .test('required', 'Ownership/Rental Agreement is required', (value) => value && value.length > 0),
  officePhotos: yup
    .mixed()
    .test('required', 'At least one Office Photo is required', (value) => value && value.length > 0),
});
