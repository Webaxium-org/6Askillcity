import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MapPin,
  FileText,
  Save,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { admissionRegistrationSchema } from "./schema";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormSearchableSelect } from "@/components/ui/form-searchable-select";
import { FormPhoneInput, COUNTRY_CODES } from "@/components/ui/form-phone-input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleFormError } from "../../utils/handleFormError";
import { showAlert } from "../../redux/alertSlice";
import { registerAdmissionPoint } from "../../api/admissionPoint.api";
import Navbar from "../../components/Navbar";

export default function AdmissionRegistration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(admissionRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      licenseePhoto: [],
      licenseeAadharCard: [],
      businessLicense: [],
      ownershipRentalAgreement: [],
      officePhotos: [],
      contactPersonPhoneCode: "+91",
      localRefMobile1Code: "+91",
      localRefMobile2Code: "+91",
    },
  });

  useEffect(() => {
    docFields.forEach((field) => register(field.id));
  }, [register]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    countries: false,
    states: false,
    cities: false,
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Fetch Countries on Mount
  useEffect(() => {
    setLoadingStates((prev) => ({ ...prev, countries: true }));
    try {
      const allCountries = Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.name,
        isoCode: c.isoCode,
      }));
      setCountries(allCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, countries: false }));
    }
  }, []);

  // Fetch States when Country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      setValue("state", "");
      setValue("city", "");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, states: true }));
    try {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === selectedCountry,
      );
      if (countryObj) {
        const countryStates = State.getStatesOfCountry(countryObj.isoCode).map(
          (s) => ({
            label: s.name,
            value: s.name,
            isoCode: s.isoCode,
          }),
        );
        setStates(countryStates);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, states: false }));
    }

    setCities([]);
    setValue("state", "");
    setValue("city", "");
  }, [selectedCountry, setValue]);

  // Fetch Cities when State changes
  useEffect(() => {
    if (!selectedState || !selectedCountry) {
      setCities([]);
      setValue("city", "");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, cities: true }));
    try {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === selectedCountry,
      );
      const stateObj = State.getStatesOfCountry(countryObj?.isoCode).find(
        (s) => s.name === selectedState,
      );

      if (countryObj && stateObj) {
        const stateCities = City.getCitiesOfState(
          countryObj.isoCode,
          stateObj.isoCode,
        ).map((c) => ({
          label: c.name,
          value: c.name,
        }));
        setCities(stateCities);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, cities: false }));
    }

    setValue("city", "");
  }, [selectedState, selectedCountry, setValue]);

  // Auto-sync phone codes with selected country
  useEffect(() => {
    const countryData = COUNTRY_CODES.find(
      (c) => c.country === selectedCountry,
    );
    if (countryData) {
      setValue("contactPersonPhoneCode", countryData.code);
      setValue("localRefMobile1Code", countryData.code);
      setValue("localRefMobile2Code", countryData.code);
    }
  }, [selectedCountry, setValue]);

  const watchedValues = watch();

  const handleFileChange = (fieldName, newFiles) => {
    const currentFiles = watchedValues[fieldName] || [];
    const filesArray = Array.from(newFiles);
    const updatedFiles = [...currentFiles, ...filesArray];
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const removeFile = (fieldName, fileIndex) => {
    const currentFiles = watchedValues[fieldName] || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== fileIndex);
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "contactPersonName",
        "contactPersonPhone",
        "licenseeName",
        "licenseeEmail",
        "localRefName1",
        "localRefMobile1",
        "localRefName2",
        "localRefMobile2",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "centerName",
        "centerAddress",
        "country",
        "state",
        "city",
        "pincode",
      ];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const docKeys = [
        "licenseePhoto",
        "licenseeAadharCard",
        "businessLicense",
        "ownershipRentalAgreement",
        "officePhotos",
      ];

      Object.keys(data).forEach((key) => {
        if (docKeys.includes(key)) {
          if (data[key] && data[key].length > 0) {
            data[key].forEach((file) => formData.append(key, file));
          }
        } else if (["contactPersonPhoneCode", "localRefMobile1Code", "localRefMobile2Code"].includes(key)) {
          // Skip individual code fields
        } else if (key === "contactPersonPhone") {
          formData.append(key, (data.contactPersonPhoneCode || "") + data.contactPersonPhone);
        } else if (key === "localRefMobile1") {
          formData.append(key, (data.localRefMobile1Code || "") + data.localRefMobile1);
        } else if (key === "localRefMobile2") {
          formData.append(key, (data.localRefMobile2Code || "") + data.localRefMobile2);
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
          message:
            "Your application has been received. We will notify you as soon as review is done. Thanks",
        }),
      );
      setTimeout(() => {
        setIsSuccess(false);
        navigate("/");
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

  const steps = [
    { id: 1, title: "Contact", icon: Users },
    { id: 2, title: "Center", icon: MapPin },
    { id: 3, title: "Documents", icon: FileText },
  ];

  const docFields = [
    { id: "licenseePhoto", label: "Licensee Photo" },
    { id: "licenseeAadharCard", label: "Licensee Aadhar Card" },
    { id: "businessLicense", label: "Business License" },
    { id: "ownershipRentalAgreement", label: "Ownership / Rental Agreement" },
    { id: "officePhotos", label: "Office Photos" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0C10] relative overflow-hidden font-sans transition-colors duration-500">
      <Navbar />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={() => navigate("/")}
          className="flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white mb-10 transition-colors group text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <ArrowLeft
            size={14}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Dashboard
        </motion.button>

        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase italic"
          >
            Admission Point <span className="text-primary">Registration</span>
          </motion.h1>
          <p className="text-slate-500 text-sm font-medium max-w-lg mx-auto mb-8">
            Partner with 6A Skillcity. Complete the form below to register your
            center.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] text-left mb-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2">
                  Required Documents Checklist
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4">
                  Please keep digital copies of these documents ready for the
                  upload stage:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Licensee Photo",
                    "Licensee Aadhar Card",
                    "Business License",
                    "Ownership / Rental Agreement",
                    "Office Photos",
                  ].map((doc) => (
                    <span
                      key={doc}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-slate-800/50 shadow-2xl rounded-[40px] p-8 md:p-14 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-20 max-w-xl mx-auto relative px-4">
            <div className="absolute top-6 left-8 right-8 h-[1px] bg-slate-200 dark:bg-slate-800 z-0">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                className="h-full bg-primary shadow-[0_0_10px_rgba(184,36,36,0.5)]"
              />
            </div>

            {steps.map((step) => {
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center gap-4"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border",
                      isActive
                        ? "bg-white dark:bg-slate-900 border-primary text-primary shadow-[0_0_20px_rgba(184,36,36,0.15)]"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700",
                    )}
                  >
                    {isActive && currentStep > step.id ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <step.icon size={18} />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                      isCurrent
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-700",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
                >
                  <FormInput
                    label="Contact Person Name"
                    id="contactPersonName"
                    placeholder="Full Legal Name"
                    {...register("contactPersonName")}
                    error={errors.contactPersonName}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <FormPhoneInput
                    label="Contact Person Phone"
                    id="contactPersonPhone"
                    placeholder="00000 00000"
                    codeValue={watch("contactPersonPhoneCode")}
                    onCodeChange={(val) => setValue("contactPersonPhoneCode", val)}
                    {...register("contactPersonPhone")}
                    error={errors.contactPersonPhone}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <FormInput
                    label="Licensee Name"
                    id="licenseeName"
                    placeholder="Business Entity Name"
                    {...register("licenseeName")}
                    error={errors.licenseeName}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <FormInput
                    label="Licensee Email"
                    id="licenseeEmail"
                    type="email"
                    placeholder="official@domain.com"
                    {...register("licenseeEmail")}
                    error={errors.licenseeEmail}
                    className="text-slate-700 dark:text-slate-200"
                  />

                  <div className="md:col-span-2 pt-6 flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 whitespace-nowrap">
                      Identity References
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800/50" />
                  </div>

                  <FormInput
                    label="Ref Person 1 Name"
                    id="localRefName1"
                    placeholder="Primary Ref"
                    {...register("localRefName1")}
                    error={errors.localRefName1}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <FormPhoneInput
                    label="Ref Person 1 Mobile"
                    id="localRefMobile1"
                    placeholder="00000 00000"
                    codeValue={watch("localRefMobile1Code")}
                    onCodeChange={(val) => setValue("localRefMobile1Code", val)}
                    {...register("localRefMobile1")}
                    error={errors.localRefMobile1}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <FormInput
                    label="Ref Person 2 Name"
                    id="localRefName2"
                    placeholder="Secondary Ref"
                    {...register("localRefName2")}
                    error={errors.localRefName2}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <FormPhoneInput
                    label="Ref Person 2 Mobile"
                    id="localRefMobile2"
                    placeholder="00000 00000"
                    codeValue={watch("localRefMobile2Code")}
                    onCodeChange={(val) => setValue("localRefMobile2Code", val)}
                    {...register("localRefMobile2")}
                    error={errors.localRefMobile2}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
                >
                  <div className="md:col-span-2">
                    <FormInput
                      label="Center Name"
                      id="centerName"
                      placeholder="Operational Branch Name"
                      {...register("centerName")}
                      error={errors.centerName}
                      className="text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput
                      label="Operational Address"
                      id="centerAddress"
                      placeholder="Full Street Address"
                      {...register("centerAddress")}
                      error={errors.centerAddress}
                      className="text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <FormSearchableSelect
                        {...field}
                        label="Country"
                        placeholder="Select Country"
                        options={countries}
                        loading={loadingStates.countries}
                        error={errors.country}
                        className="text-slate-700 dark:text-slate-200"
                      />
                    )}
                  />
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <FormSearchableSelect
                        {...field}
                        label="State"
                        placeholder="Select State"
                        options={states}
                        loading={loadingStates.states}
                        disabled={!selectedCountry || loadingStates.states}
                        error={errors.state}
                        className="text-slate-700 dark:text-slate-200"
                      />
                    )}
                  />
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <FormSearchableSelect
                        {...field}
                        label="City"
                        placeholder="Select City"
                        options={cities}
                        loading={loadingStates.cities}
                        disabled={!selectedState || loadingStates.cities}
                        error={errors.city}
                        className="text-slate-700 dark:text-slate-200"
                      />
                    )}
                  />
                  <FormInput
                    label="Pincode"
                    id="pincode"
                    placeholder="000 000"
                    {...register("pincode")}
                    error={errors.pincode}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {docFields.map((field) => (
                      <div
                        key={field.id}
                        className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-10 h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center group-hover:text-primary group-hover:border-primary/20 transition-all shadow-inner">
                            <FileText size={18} />
                          </div>
                          <h3 className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.2em]">
                            {field.label}
                          </h3>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-6 -mt-4 opacity-60">
                          Max size: 5MB (JPG, PNG, PDF)
                        </p>

                        <div className="space-y-3 mb-8">
                          <AnimatePresence mode="popLayout">
                            {watchedValues[field.id]?.map((file, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-between bg-white dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 group/file"
                              >
                                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate max-w-[160px]">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(field.id, idx)}
                                  className="text-slate-400 dark:text-slate-600 hover:text-red-500 p-1.5 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(field.id, e.target.files)
                            }
                          />
                          <div className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-950 hover:border-primary/30 transition-all duration-500 text-slate-400 dark:text-slate-600 hover:text-primary">
                            <Plus
                              size={24}
                              className="group-hover:scale-110 transition-transform"
                            />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                              Add Documents
                            </span>
                          </div>
                        </label>

                        {errors[field.id] && (
                          <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-5 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            {errors[field.id].message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-16 border-t border-slate-200 dark:border-slate-800/50">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-5">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl group"
                  >
                    Continue
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className={cn(
                      "flex items-center gap-4 px-12 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl",
                      isSuccess
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-primary/30",
                    )}
                  >
                    {isSubmitting ? (
                      "Processing"
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 size={18} />
                        Completed
                      </>
                    ) : (
                      <>
                        Finalize Registration
                        <Save size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>

        <p className="text-center text-slate-400 dark:text-slate-700 text-[9px] font-black uppercase tracking-[0.3em] mt-16">
          © 2024 6A Skillcity Security Protocol • Tier-1 Encryption
        </p>
      </div>
    </div>
  );
}
