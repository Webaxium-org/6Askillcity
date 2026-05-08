import * as yup from 'yup';

const phoneRegex = /^[0-9+\s\-()]{10,15}$/;

export const admissionRegistrationSchema = yup.object().shape({
  // Step 1: Contact Details
  contactPersonName: yup.string().required('Contact Person Name is required'),
  contactPersonPhone: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .required('Contact Person Phone Number is required'),
  licenseeName: yup.string().required('Licensee Name is required').trim(),
  licenseeEmail: yup
    .string()
    .email('Please enter a valid email address')
    .required('Licensee Email is required')
    .lowercase(),
  localRefName1: yup.string().required('Local Reference Person Name is required'),
  localRefMobile1: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .required('Mobile Number is required'),
  localRefName2: yup.string().required('Local Reference Person Name 2 is required'),
  localRefMobile2: yup
    .string()
    .matches(phoneRegex, 'Invalid phone number format')
    .required('Mobile Number 2 is required'),

  // Step 2: Center Details
  centerName: yup.string().required('Center Name is required').trim(),
  centerAddress: yup.string().required('Center Address is required'),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  pincode: yup.string().required('Pincode is required'),

  // Step 3: Documents
  licenseePhoto: yup.mixed()
    .test('required', 'Licensee Photo is required', (value) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof FileList) return value.length > 0;
      return !!value;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value || !Array.isArray(value)) return true;
      return value.every(file => file.size <= 5 * 1024 * 1024);
    }),
  licenseeAadharCard: yup.mixed()
    .test('required', 'Aadhar Card is required', (value) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof FileList) return value.length > 0;
      return !!value;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value || !Array.isArray(value)) return true;
      return value.every(file => file.size <= 5 * 1024 * 1024);
    }),
  businessLicense: yup.mixed()
    .test('required', 'Business License is required', (value) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof FileList) return value.length > 0;
      return !!value;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value || !Array.isArray(value)) return true;
      return value.every(file => file.size <= 5 * 1024 * 1024);
    }),
  ownershipRentalAgreement: yup.mixed()
    .test('required', 'Ownership/Rental Agreement is required', (value) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof FileList) return value.length > 0;
      return !!value;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value || !Array.isArray(value)) return true;
      return value.every(file => file.size <= 5 * 1024 * 1024);
    }),
  officePhotos: yup.mixed()
    .test('required', 'Office Photos are required', (value) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof FileList) return value.length > 0;
      return !!value;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value || !Array.isArray(value)) return true;
      return value.every(file => file.size <= 5 * 1024 * 1024);
    }),
});
