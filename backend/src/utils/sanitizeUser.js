export const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  name: user.name,
  roles: user.roles,
  profile: user.profile,
  dateOfBirth: user.dateOfBirth
});