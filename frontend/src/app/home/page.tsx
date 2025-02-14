"use client";

import { useEffect, useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "./components/loginForm";
import SignupForm from "./components/signupForm";
import RegisterForm from "./components/registerForm";
import OtpForm from "./components/otpForm";
import { useAuthStore } from "@/stores/authStore";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Home = () => {
  const { authAction, updateAuthAction } = useAuthStore((state) => state);
  const searchParams = useSearchParams();
  const [registerEmail, setRegisterEmail] = useState("");
  const { toast } = useToast();
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  useEffect(() => {
    const verifyServerConnection = async () => {
      try {
        console.log(
          (
            await axiosInstance(`${BACKEND_URL}`, {
              withCredentials: true,
            })
          ).data
        );
      } catch (err) {
        handleUnexpectedError(err);
      }
    };
    verifyServerConnection();
  }, []);

  useEffect(() => {
    const verifyRegisterToken = async () => {
      const registerToken = searchParams.get("registerToken");
      if (registerToken) {
        try {
          const tokenVerified = await axiosInstance.post(
            `${BACKEND_URL}/token/verifyParamToken`,
            { token: registerToken },
            { withCredentials: true }
          );
          if (tokenVerified.data.tokenVerified) {
            updateAuthAction("register");
            setRegisterEmail(tokenVerified.data.decoded.useremail);
            toast({
              title: "Token verified",
              description: "Please complete the registration form.",
              duration: 3000,
            });
          } else if (tokenVerified.data.errorMessage === "jwt malformed")
            toast({
              variant: "destructive",
              title: "Token malformed",
              description: "The token is malformed. Please signup again.",
              duration: 3000,
            });
          else if (tokenVerified.data.errorMessage === "jwt expired")
            toast({
              variant: "destructive",
              title: "Token expired",
              description: "The token has expired. Please signup again.",
              duration: 3000,
            });
          else throw new Error("Token not verified");
        } catch (err) {
          handleUnexpectedError(err);
          updateAuthAction("login");
        }
      }
    };
    verifyRegisterToken();
  }, []);

  return (
    <div className="flex flex-col h-dvh items-center justify-center gap-4 min-h-[500px] min-w-[320px]">
      <h1 className="text-3xl font-bold">Just In Chat</h1>
      <p className="text-sm text-muted-foreground">
        Your <span className="font-semibold">Secure</span> and{" "}
        <span className="font-semibold">Private</span> Live Chat Space
      </p>
      {authAction === "login" ? (
        <LoginForm />
      ) : authAction === "signup" ? (
        <SignupForm />
      ) : authAction === "register" ? (
        <RegisterForm registerEmail={registerEmail} />
      ) : (
        <OtpForm />
      )}
      <p className="text-muted-foreground">
        {authAction === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <span
          className="font-semibold hover:underline hover:cursor-pointer"
          onClick={() => {
            if (authAction === "login") updateAuthAction("signup");
            else updateAuthAction("login");
          }}
        >
          {authAction === "login" || authAction === "2fa" ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
};

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-dvh items-center justify-center gap-4 min-h-[500px] min-w-[320px]">
          <h1 className="text-3xl font-bold">Just In Chat</h1>
          <p className="text-sm text-muted-foreground">
            Your <span className="font-semibold">Secure</span> and{" "}
            <span className="font-semibold">Private</span> Live Chat Space
          </p>
        </div>
      }
    >
      <Home />
    </Suspense>
  );
};

export default App;
