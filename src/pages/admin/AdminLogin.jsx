import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import axiosInstance, { tokenStorage } from "../../lib/axios";
import { useNavigate } from "react-router";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: (data) => axiosInstance.post("/admin/login", data),
    onSuccess: (data) => {
      console.log(data);
      navigate("/admincpanel");
      tokenStorage.set(data.data.token, data.data.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    login(data);
  };
  return (
    <div>
      <h1>Admin Login</h1>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                {...register("email")}
                placeholder="Email"
                className="border border-gray-300 rounded-md p-2"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col items-center justify-center">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="Password"
                className="border border-gray-300 rounded-md p-2"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <button
              disabled={isPending}
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
