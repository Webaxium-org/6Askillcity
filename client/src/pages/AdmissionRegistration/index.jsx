import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { Building2, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import { admissionRegistrationSchema } from "./schema";
import { FormInput } from "@/components/ui/form-input";
import { FormFile } from "@/components/ui/form-file";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleFormError } from "../../utils/handleFormError";
import { showAlert } from "../../redux/alertSlice";
import { registerAdmissionPoint } from "../../api/admissionPoint.api";

export default function AdmissionRegistration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(admissionRegistrationSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof FileList || Array.isArray(data[key])) {
          Array.from(data[key]).forEach((file) => formData.append(key, file));
        } else {
          formData.append(key, data[key]);
        }
      });

      const responseData = await registerAdmissionPoint(formData);

      setIsSubmitting(false);
      setIsSuccess(true);

      dispatch(
        showAlert({
          type: "success",
          message: responseData.message || "Registration Successful!",
        }),
      );

      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      handleFormError(error, setError, dispatch, navigate);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12366A] to-[#17468C] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B82424] opacity-10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#4338ca] opacity-20 blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.button
          onClick={() => navigate("/")}
          className="flex items-center text-white/80 hover:text-white mb-6 transition-colors group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft
            size={16}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </motion.button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner p-1 border border-white/10">
              <div className="w-full h-full bg-gradient-to-br from-[#17468C] to-[#B82424] rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
              Admission Point Registration
            </h1>
            <p className="text-blue-100/80 text-lg max-w-2xl mx-auto">
              Partner with 6A Skillcity. Complete the form below to register
              your center.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-7">
              {/* Row 1 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Center Name"
                  id="centerName"
                  placeholder="Enter center name"
                  {...register("centerName")}
                  error={errors.centerName}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Licensee Name"
                  id="licenseeName"
                  placeholder="Enter licensee name"
                  {...register("licenseeName")}
                  error={errors.licenseeName}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Licensee Email"
                  id="licenseeEmail"
                  type="email"
                  placeholder="email@example.com"
                  {...register("licenseeEmail")}
                  error={errors.licenseeEmail}
                />
              </motion.div>

              {/* Row 2 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Licensee Contact Number"
                  id="licenseeContactNumber"
                  placeholder="+1234567890"
                  {...register("licenseeContactNumber")}
                  error={errors.licenseeContactNumber}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Contact Person Name"
                  id="contactPersonName"
                  placeholder="Enter contact person name"
                  {...register("contactPersonName")}
                  error={errors.contactPersonName}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Contact Person Phone Number"
                  id="contactPersonPhone"
                  placeholder="+1234567890"
                  {...register("contactPersonPhone")}
                  error={errors.contactPersonPhone}
                />
              </motion.div>

              {/* Row 3 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Contact Person Email"
                  id="contactPersonEmail"
                  type="email"
                  placeholder="contact@example.com"
                  {...register("contactPersonEmail")}
                  error={errors.contactPersonEmail}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Local Reference Person Name"
                  id="localRefName1"
                  placeholder="Reference 1 Name"
                  {...register("localRefName1")}
                  error={errors.localRefName1}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Local Reference Person Mobile Number 1"
                  id="localRefMobile1"
                  placeholder="+1234567890"
                  {...register("localRefMobile1")}
                  error={errors.localRefMobile1}
                />
              </motion.div>

              {/* Row 4 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Local Reference Person Name"
                  id="localRefName2"
                  placeholder="Reference 2 Name"
                  {...register("localRefName2")}
                  error={errors.localRefName2}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Local Reference Person Mobile Number 2"
                  id="localRefMobile2"
                  placeholder="+1234567890"
                  {...register("localRefMobile2")}
                  error={errors.localRefMobile2}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Center Address"
                  id="centerAddress"
                  placeholder="Street Address"
                  {...register("centerAddress")}
                  error={errors.centerAddress}
                />
              </motion.div>

              {/* Row 5 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Country"
                  id="country"
                  placeholder="Country"
                  {...register("country")}
                  error={errors.country}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="State"
                  id="state"
                  placeholder="State/Province"
                  {...register("state")}
                  error={errors.state}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="City"
                  id="city"
                  placeholder="City"
                  {...register("city")}
                  error={errors.city}
                />
              </motion.div>

              {/* Row 6 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Pincode"
                  id="pincode"
                  placeholder="Postal / Zip code"
                  {...register("pincode")}
                  error={errors.pincode}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormFile
                  label="Licensee Photo"
                  id="licenseePhoto"
                  accept="image/*"
                  {...register("licenseePhoto")}
                  error={errors.licenseePhoto}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormFile
                  label="Licensee Adhar card"
                  id="licenseeAadharCard"
                  accept="image/*,.pdf"
                  {...register("licenseeAadharCard")}
                  error={errors.licenseeAadharCard}
                />
              </motion.div>

              {/* Row 7 */}
              <motion.div variants={itemVariants}>
                <FormFile
                  label="Upload Business License"
                  id="businessLicense"
                  accept=".pdf,image/*"
                  {...register("businessLicense")}
                  error={errors.businessLicense}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormFile
                  label="Ownership/Rental Agreement Copy"
                  id="ownershipRentalAgreement"
                  accept=".pdf,image/*"
                  {...register("ownershipRentalAgreement")}
                  error={errors.ownershipRentalAgreement}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormFile
                  label="Office Photos"
                  id="officePhotos"
                  accept="image/*"
                  multiple
                  {...register("officePhotos")}
                  error={errors.officePhotos}
                />
              </motion.div>
            </div>

            {/* Submit Actions */}
            <motion.div
              variants={itemVariants}
              className="pt-8 w-full mt-4 flex justify-center"
            >
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={cn(
                  "relative group w-full md:w-2/3 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-[#B82424]/30 shadow-2xl transition-all overflow-hidden",
                  isSuccess
                    ? "bg-green-600 shadow-green-500/30"
                    : "bg-gradient-to-r from-[#B82424] to-red-600 hover:scale-[1.02] active:scale-[0.98]",
                  isSubmitting && "opacity-80 cursor-not-allowed",
                )}
              >
                {!isSuccess && (
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      PROCESSING...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={22} className="animate-bounce" />
                      SUBMITTED SUCCESSFULLY
                    </>
                  ) : (
                    <>
                      SUBMIT
                      <Save
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
