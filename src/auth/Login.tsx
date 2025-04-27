import { useEffect } from "react";
import {
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { CiHome } from "react-icons/ci";
import { auth } from "../firebaseConfig";

// ✅ Fix react-icons typing issue
const FcGoogleIcon = FcGoogle as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const CiHomeIcon = CiHome as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        toast.success(`Welcome back, ${user.displayName || "User"}!`);
        navigate("/features");
      }
    });

    // Handle Google redirect login results
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast.success(`Welcome, ${result.user.displayName || "User"}!`);
          navigate("/features");
        }
      })
      .catch((err) => {
        console.error("Google Login Error:", err);
        toast.error("Google login failed. Please try again.");
      });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope("email");
      googleProvider.addScope("profile");

      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithPopup(auth, googleProvider);

      console.log("Google Login Success:", result.user);
      toast.success(`Welcome, ${result.user.displayName || "User"}!`);
      navigate("/features");
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-indigo-700">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h2>
          <p className="text-gray-600">Sign in with your Google account to continue</p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-800 font-medium p-4 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-300 ease-in-out"
          >
            <FcGoogleIcon className="mr-3 text-2xl" />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center mt-4 justify-center w-full bg-white border border-gray-300 text-gray-800 font-medium p-4 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-300 ease-in-out"
          >
            <CiHomeIcon className="mr-3 text-2xl" />
            <span>Back to Home</span>
          </button>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>By continuing, you agree to our</p>
            <p>Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
