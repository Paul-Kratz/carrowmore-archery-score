export const GATE_CODE_COOKIE = "x-gate-code";

const getTrimmedEnv = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : null;
};

export const getSiteGateCode = () => getTrimmedEnv("SITE_GATE_CODE");

export const getAdminUserId = () => getTrimmedEnv("ADMIN_USER_ID");
