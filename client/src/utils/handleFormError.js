import { showAlert } from "../redux/alertSlice";
import { logOut } from "../redux/userSlice";
// import { disconnectSocket } from './socket';

export const handleFormError = (error, setFormErrors, dispatch, navigate) => {
  const validationErrors = {};

  // Check if the error is a Yup validation error
  if (error?.inner && Array.isArray(error.inner)) {
    error.inner.forEach((innerError) => {
      validationErrors[innerError.path] = innerError.message;
    });
  }

  const errorMessage =
    error?.response?.data?.message || error?.message || "Something went wrong.";

  if (import.meta.env.VITE_NODE_ENV === "development") {
    console.error(error); // Log full error in development
    console.error(validationErrors); // Log full error in development
  }

  // Set form validation errors if any (using react-hook-form standard setError dynamically)
  if (setFormErrors) {
    if (Object.keys(validationErrors).length > 0) {
      // It's a direct Yup validation error mapped as an object
      Object.entries(validationErrors).forEach(([key, value]) => {
         setFormErrors(key, { type: 'manual', message: value });
      });
    } else if (error?.response?.data?.errors) {
       // Backend validation errors format handling (e.g. express-validator)
       const backendErrors = error.response.data.errors;
       if (Array.isArray(backendErrors)) {
           backendErrors.forEach(err => setFormErrors(err.path || err.param, { type: 'manual', message: err.msg }));
       } else if (typeof backendErrors === 'object') {
           Object.entries(backendErrors).forEach(([key, value]) => {
               setFormErrors(key, { type: 'manual', message: value });
           });
       }
    } else {
        // Fallback for simple single-field error object passed from user snippet natively
        // Try direct call
        try {
           setFormErrors(validationErrors);
        } catch(e) { }
    }
  }

  if (error?.response?.status === 401 || error?.response?.status === 403) {
    if (error?.response?.data?.message === "ONBOARDING_REQUIRED") {
      navigate("/onboarding/account-type");
    } else {
      // disconnectSocket();
      dispatch(logOut()); // Clear user state in Redux
      navigate("/login"); // Optional standard redirect
    }
  }

  if (error?.response?.status === 500) {
    navigate("/server-error"); // Redirect to server error page
  }

  if (error?.response?.status === 404) {
    navigate("/not-found"); // Redirect to 404 error page
  }

  // Dispatch alert for API or other errors
  dispatch(
    showAlert({
      type: error.response ? "error" : "warning",
      message: errorMessage,
    })
  );
};
