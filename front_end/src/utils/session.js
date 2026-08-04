export function normalizeSession(session) {
  if (!session?.token) return null;
  const currentUser = session.currentUser || session.user || session.result?.currentUser || null;
  return { ...session, currentUser };
}

export function readStoredSession() {
  try {
    const raw = localStorage.getItem("session");
    if (!raw || raw === "undefined") return null;
    const parsed = JSON.parse(raw);
    return normalizeSession(parsed);
  } catch {
    localStorage.removeItem("session");
    return null;
  }
}

export function getActiveSession(contextSession) {
  const storedSession = readStoredSession();
  const normalizedContext = normalizeSession(contextSession);
  if (!normalizedContext) return storedSession;
  if (!normalizedContext.currentUser && storedSession?.currentUser) {
    return { ...storedSession, ...normalizedContext, currentUser: storedSession.currentUser };
  }
  return normalizedContext;
}

export function isAuthenticated(contextSession) {
  return Boolean(getActiveSession(contextSession)?.token);
}

export function getSessionUser(contextSession) {
  return getActiveSession(contextSession)?.currentUser || null;
}

export function getSessionUserId(contextSession) {
  return getSessionUser(contextSession)?.id || null;
}

export function normalizeRoleName(value) {
  return String(value || "")
    .replace(/^ROLE_/, "")
    .replace(/^SCOPE_/, "")
    .toUpperCase();
}

export function collectRoleNames(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(collectRoleNames);
  if (typeof value === "object") {
    return collectRoleNames(value.name || value.role || value.authority);
  }
  return [normalizeRoleName(value)];
}

export function getSessionRole(contextSession) {
  const activeSession = getActiveSession(contextSession);
  const candidates = [
    activeSession?.role,
    activeSession?.currentUser?.role,
    activeSession?.user?.role,
    activeSession?.currentUser?.roles,
    activeSession?.user?.roles,
  ];
  return candidates.flatMap(collectRoleNames).find(Boolean) || "";
}
