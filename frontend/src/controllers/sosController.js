import { addSOSContact } from "../services/sosService";

// Controller
export const handleAddSOSContact = async (
  uid,
  phone,
  message
) => {
  if (!uid || !phone || !message) {
    return {
      success: false,
      message: "All fields are required",
    };
  }

  const response = await addSOSContact(uid, {
    phone,
    message,
  });

  return response;
};