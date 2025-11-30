import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
} from "../api/services/chatApi";
import { useAuth } from "../contexts/AuthContext";

export const useMyNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
    enabled: !!user, // 👈 로그인 했을 때만 호출
  });
};

export const useUnreadNotificationCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    enabled: !!user,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["unreadNotificationCount"],
      });

      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousCount = queryClient.getQueryData([
        "unreadNotificationCount",
      ]);

      queryClient.setQueryData<any>(["notifications"], (old: any) => {
        if (!old) return old;
        return old.map((item: any) =>
          item.id === notificationId ? { ...item, read: true } : item
        );
      });

      queryClient.setQueryData<number>(["unreadNotificationCount"], (old) => {
        if (old === undefined) return 0;
        return Math.max(0, old - 1);
      });

      return { previousNotifications, previousCount };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },

    onError: (error, _, context) => {
      console.error("읽음 처리 실패:", error);
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          ["unreadNotificationCount"],
          context.previousCount
        );
      }
    },
  });
};
