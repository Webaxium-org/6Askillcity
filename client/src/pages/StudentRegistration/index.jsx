import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { UserPlus, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import { studentRegistrationSchema } from "./schema";
import { FormInput } from "@/components/ui/form-input";
import { FormFile } from "@/components/ui/form-file";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleFormError } from "../../utils/handleFormError";
import { showAlert } from "../../redux/alertSlice";
import { registerStudent } from "../../api/student.api";

export default function StudentRegistration() {
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
    resolver: yupResolver(studentRegistrationSchema),
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

      const responseData = await registerStudent(formData);

      setIsSubmitting(false);
      setIsSuccess(true);

      dispatch(
        showAlert({
          type: "success",
          message: responseData.message || "Student Registration Successful!",
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

      <div className="max-w-4xl mx-auto relative z-10">
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
                <UserPlus className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
              Student Registration
            </h1>
            <p className="text-blue-100/80 text-lg max-w-2xl mx-auto">
              Enroll with 6A Skillcity to begin your professional journey. Please provide accurate details below.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              {/* Row 1 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Full Legal Name"
                  id="name"
                  placeholder="Rahul Sharma"
                  {...register("name")}
                  error={errors.name}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Date of Birth"
                  id="dob"
                  type="date"
                  placeholder="DD/MM/YYYY"
                  {...register("dob")}
                  error={errors.dob}
                />
              </motion.div>

              {/* Row 2 */}
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="rahul@example.com"
                  {...register("email")}
                  error={errors.email}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Phone Number"
                  id="phone"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                  error={errors.phone}
                />
              </motion.div>

              {/* Row 3 */}
              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  <label htmlFor="qualification" className="text-sm font-semibold text-white">
                    Highest Qualification
                  </label>
                  <select
                    id="qualification"
                    {...register("qualification")}
                    className={cn(
                      "w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl outline-none transition-all placeholder:text-white/40 focus:border-[#B82424] focus:ring-1 focus:ring-[#B82424] text-white",
                      errors.qualification && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    <option value="" className="text-black">Select qualification</option>
                    <option value="12th" className="text-black">12th Grade / PUC</option>
                    <option value="diploma" className="text-black">Diploma</option>
                    <option value="bachelors" className="text-black">Bachelor's Degree</option>
                    <option value="masters" className="text-black">Master's Degree</option>
                  </select>
                  {errors.qualification && (
                    <p className="text-red-400 text-xs font-semibold">{errors.qualification.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  <label htmlFor="course" className="text-sm font-semibold text-white">
                    Target Course Entry
                  </label>
                  <select
                    id="course"
                    {...register("course")}
                    className={cn(
                      "w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl outline-none transition-all placeholder:text-white/40 focus:border-[#B82424] focus:ring-1 focus:ring-[#B82424] text-white",
                      errors.course && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    <option value="" className="text-black">Select assigned course</option>
                    <option value="uiux" className="text-black">Advanced UI/UX Design</option>
                    <option value="fsd" className="text-black">Full Stack Web Development</option>
                    <option value="ds" className="text-black">Data Science & AI</option>
                    <option value="dm" className="text-black">Digital Marketing Masterclass</option>
                  </select>
                  {errors.course && (
                    <p className="text-red-400 text-xs font-semibold">{errors.course.message}</p>
                  )}
                </div>
              </motion.div>

              {/* Row 4 File */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <FormFile
                  label="Upload Identity Proof (Aadhar/PAN)"
                  id="idProof"
                  accept="image/*,.pdf"
                  {...register("idProof")}
                  error={errors.idProof}
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
