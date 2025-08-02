export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const isLoggedIn = () => {
  return !!getUser();
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};

export const saveUser = (userData) => {
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }
};

export const clearUser = () => {
  localStorage.removeItem("user");
};

export const getToken = () => {
  const user = getUser();
  return user?.token || null;
};