export const getSellerIdFromSession = (session) =>
  session?.currentUser?.id || session?.user?.id || null;
