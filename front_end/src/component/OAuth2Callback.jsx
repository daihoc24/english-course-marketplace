import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        // Decode the user data
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Create session object
        const session = {
          token: token,
          currentUser: userData,
          authenticated: true,
          role: userData.roles?.[0]?.name || "USER",
        };

        // Store in localStorage
        localStorage.setItem("session", JSON.stringify(session));

        // Dispatch event to notify other components
        window.dispatchEvent(new Event("sessionUpdated"));

        // Role-based redirect
        const userRole = session.role.toUpperCase();
        switch (userRole) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          case "SELLER":
            navigate("/seller/dashboard");
            break;
          case "USER":
          default:
            navigate("/");
            break;
        }
      } catch (error) {
        console.error("Failed to process OAuth2 callback:", error);
        navigate("/login?error=oauth2_failed");
      }
    } else {
      navigate("/login?error=oauth2_failed");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing login...</p>
      </div>
    </div>
  );
};

export default OAuth2Callback;
