import * as yup from "yup";

const phoneRegex = /^[0-9+\s\-()]{10,15}$/;

export const studentRegistrationSchema = yup.object().shape({
  name: yup.string().required("Full Legal Name is required").trim(),
  dob: yup.date().required("Date of Birth is required").typeError("Please enter a valid date"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .lowercase(),
  phone: yup
    .string()
    .matches(phoneRegex, "Invalid phone number format")
    .required("Phone Number is required"),
  
  qualification: yup.string().required("Highest Qualification is required"),
  course: yup.string().required("Target Course is required"),
  university: yup.string().required("University selection is required"),
  program: yup.string().required("Program selection is required"),
  programFee: yup.string().required("Fee calculation error. Please select a program again."),

  // Files validation
  idProof: yup
    .mixed()
    .test(
      "required",
      "Identity Proof Document is required",
      (value) => value && value.length > 0
    ),
});
