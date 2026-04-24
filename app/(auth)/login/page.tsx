import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Admin | Jember Siaga",
  description: "Halaman Login Jember Siaga",
};

export default function SignIn() {
  return <SignInForm />;
}
