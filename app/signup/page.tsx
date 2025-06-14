"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, TrendingUp, Lock, Mail, User } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export default function SignupPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSignup(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Signup failed");
			router.push("/login?message=Account created successfully");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo/Brand */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-white shadow-md mb-4">
						<TrendingUp className="h-8 w-8 text-blue-600" />
						<span className="text-2xl font-bold text-gray-900">
							NEPSE Pro
						</span>
					</div>
					<h1 className="text-3xl font-extrabold text-gray-900 mb-2">
						Join NEPSE Pro
					</h1>
					<p className="text-gray-600">
						Create your trading dashboard account
					</p>
				</div>

				{/* Signup Form */}
				<Card className="bg-white border-0 shadow-xl text-gray-900">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-2xl text-center text-gray-900">
							Create Account
						</CardTitle>
						<CardDescription className="text-center text-gray-500">
							Enter your details to get started
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSignup} className="space-y-6">
							<div className="space-y-2">
								<Label
									htmlFor="name"
									className="text-gray-700"
								>
									Full Name
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="name"
										type="text"
										placeholder="Enter your full name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="pl-10 bg-blue-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-gray-700"
								>
									Email
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="email"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="pl-10 bg-blue-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-gray-700"
								>
									Password
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Create a secure password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="pl-10 pr-10 bg-blue-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400"
										required
										minLength={6}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-100"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								<p className="text-xs text-gray-400">
									Password must be at least 6 characters long
								</p>
							</div>

							{error && (
								<div className="p-3 bg-red-100 border border-red-300 rounded-lg">
									<p className="text-red-600 text-sm">
										{error}
									</p>
								</div>
							)}

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md"
								disabled={loading}
							>
								{loading ? (
									<div className="flex items-center gap-2">
										<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
										Creating account...
									</div>
								) : (
									"Create Account"
								)}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-gray-500">
								Already have an account?{" "}
								<button
									onClick={() => router.push("/login")}
									className="text-blue-600 font-semibold hover:underline"
								>
									Sign in
								</button>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
