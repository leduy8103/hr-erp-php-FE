const getUserRole = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    return userData.user?.role || userData.role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

const isAdminOrManager = () => {
  const userRole = getUserRole();
  return userRole === "Admin" || userRole === "Manager";
};

const isAdminOrAccountant = () => {
  const userRole = getUserRole();
  return userRole === "Admin" || userRole === "Accountant";
};

const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

export {
  getUserRole,
  hasRole,
  isAdminOrManager,
  isAdminOrAccountant,
  hasAnyRole
};
