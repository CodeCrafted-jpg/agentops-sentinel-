import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950">
      <SignUp routing="hash" />
    </div>
  );
}

