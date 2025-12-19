"use client";

export default function Profile() {
  const user = { email: "test@gmail.com", name: "Test Doe" };
  return (
    <div className="profile-card action-card">
      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-email">{user.email}</p>
    </div>
  );
}
