function layout({ children }: { children: React.ReactNode }) {
  const email = "pranay@gmail.com";
  const password = "52s5&8ss55Bop";

  return (
    <div className="flex items-center justify-center min-w-screen">
      <div className="flex space-y-8 flex-col mt-28">
        <div className="flex flex-col space-y-2 w-full text-sm font-semibold">
          <p className="text-xl font-semibold">Demo Email and Password for Login</p>
          <div className="flex space-x-2 w-full">
            <p>Email:</p>
            <p>{email}</p>
          </div>
          <div className="flex space-x-2 w-full">
            <p>Password:</p>
            <p>{password}</p>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default layout;
