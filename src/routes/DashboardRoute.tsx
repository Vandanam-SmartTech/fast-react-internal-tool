// utils/redirectToDashboard.ts
import { fetchClaims } from "../services/jwtService"; 

export const redirectToDashboard = async (navigate: any, setError?: (msg: string) => void) => {
  try {
    const claims = await fetchClaims(); 
    const roles = claims.roles;

    if (roles.includes("ROLE_REPRESENTATIVE")) {
      navigate("/RepresentativeDashboard");
    } else if (roles.includes("ROLE_ADMIN")) {
      navigate("/AdminDashboard");
    } else {
      setError?.("Unauthorized role.");
    }
  } catch (err) {
    setError?.("Failed to determine user role.");
  }
};
