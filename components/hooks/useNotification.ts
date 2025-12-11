import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  deleteAllNotifications,
  deleteNotification,
} from "../api/services/chatApi";
import { useAuth } from "../contexts/AuthContext";

export const useMyNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
    enabled: !!user,
  });
};

export const useUnreadNotificationCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
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

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["unreadNotificationCount"],
      });

      const previousNotifications = queryClient.getQueryData<any>([
        "notifications",
      ]);
      const previousCount = queryClient.getQueryData<number>([
        "unreadNotificationCount",
      ]);

      const deletedNotification = previousNotifications?.find(
        (n: any) => n.id === notificationId
      );
      const wasUnread = deletedNotification && !deletedNotification.read;

      queryClient.setQueryData<any>(["notifications"], (old: any) => {
        if (!old) return old;
        return old.filter((item: any) => item.id !== notificationId);
      });

      if (wasUnread) {
        queryClient.setQueryData<number>(["unreadNotificationCount"], (old) => {
          if (old === undefined) return 0;
          return Math.max(0, old - 1);
        });
      }

      return { previousNotifications, previousCount };
    },

    onError: (error, _, context) => {
      console.error("삭제 실패:", error);
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

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllNotifications(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["unreadNotificationCount"],
      });

      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousCount = queryClient.getQueryData([
        "unreadNotificationCount",
      ]);

      queryClient.setQueryData(["notifications"], []);
      queryClient.setQueryData(["unreadNotificationCount"], 0);

      return { previousNotifications, previousCount };
    },

    onError: (error, _, context) => {
      console.error("전체 삭제 실패:", error);
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
