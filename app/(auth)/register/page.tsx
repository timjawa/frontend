import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Jember Siaga",
  description: "Halaman Registrasi Jember Siaga",
};

export default function SignUp() {
  return <SignUpForm />;
}
