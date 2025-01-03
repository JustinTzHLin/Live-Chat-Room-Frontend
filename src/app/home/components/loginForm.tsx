import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, X, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

const formSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
});

const LoginForm = ({ toast }: { toast: any }) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePreviousURL } = useAuthStore((state) => state);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log(values);
    const { email, password } = values;
    try {
      const loginResult = await axios.post(
        BACKEND_URL + "/user/signIn",
        { email, password },
        { withCredentials: true }
      );
      if (!loginResult.data.userExists)
        toast({
          title: "User not found",
          description: "Please signup instead.",
          duration: 3000,
        });
      else if (loginResult.data.userVerified) {
        updatePreviousURL("/home");
        router.push("/main");
        toast({
          title: "User logged in",
          description: "Welcome back!",
          duration: 3000,
        });
      } else
        toast({
          title: "Email or password incorrect",
          description: "Please try again.",
          duration: 3000,
        });
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: "Something went wrong. Please try again.",
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col w-full max-w-sm justify-center gap-3 px-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="text"
                    placeholder="JustInChat@example.com"
                    className="focus-visible:ring-slate-400 pl-8"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => {
                    form.setValue("email", "");
                    console.log(field.onChange);
                  }}
                  className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground rounded-full"
                >
                  <X />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Secure Password"
                    className="focus-visible:ring-slate-400 pl-8"
                    {...field}
                  />
                </FormControl>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground rounded-full"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full mt-3" type="submit" disabled={isLoading}>
          {isLoading && <LoaderCircle className="animate-spin" />}
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
