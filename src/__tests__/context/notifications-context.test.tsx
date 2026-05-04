import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { NotificationsProvider, useNotifications } from "@/context/notifications-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

function TestConsumer() {
  const { notifications, hasUnread, addNotification, markAllRead, clearAll } = useNotifications();
  return (
    <>
      <Text testID="count">{notifications.length}</Text>
      <Text testID="hasUnread">{String(hasUnread)}</Text>
      <Text
        testID="add"
        onPress={() =>
          addNotification({
            vagaId: "v1",
            vagaTitle: "Garçom",
            title: "Atualização: Garçom",
            body: 'Status avançou para "Pagamento"',
          })
        }
      />
      <Text testID="markAllRead" onPress={markAllRead} />
      <Text testID="clearAll" onPress={clearAll} />
    </>
  );
}

function renderWithProvider() {
  return render(
    <NotificationsProvider>
      <TestConsumer />
    </NotificationsProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(null);
});

describe("NotificationsProvider", () => {
  it("starts with empty notifications list", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(0);
    });
  });

  it("hasUnread is false when no notifications", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("hasUnread").props.children).toBe("false");
    });
  });

  it("loads persisted notifications from AsyncStorage on mount", async () => {
    const stored = [
      {
        id: "abc",
        vagaId: "v1",
        vagaTitle: "Garçom",
        title: "t",
        body: "b",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    mockGetItem.mockResolvedValueOnce(JSON.stringify(stored));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(1);
      expect(screen.getByTestId("hasUnread").props.children).toBe("true");
    });
  });

  it("ignores malformed AsyncStorage data gracefully", async () => {
    mockGetItem.mockResolvedValueOnce("not-valid-json{");

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(0);
    });
  });

  it("addNotification prepends a new notification and persists to storage", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(0);
    });

    fireEvent.press(screen.getByTestId("add"));

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(1);
      expect(screen.getByTestId("hasUnread").props.children).toBe("true");
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      "@app_notifications",
      expect.stringContaining("Garçom")
    );
  });

  it("markAllRead sets all notifications to read and persists", async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify([
        {
          id: "x1",
          vagaId: "v1",
          vagaTitle: "T",
          title: "t",
          body: "b",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ])
    );

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("hasUnread").props.children).toBe("true");
    });

    fireEvent.press(screen.getByTestId("markAllRead"));

    await waitFor(() => {
      expect(screen.getByTestId("hasUnread").props.children).toBe("false");
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      "@app_notifications",
      expect.stringContaining('"read":true')
    );
  });

  it("clearAll empties notifications and persists empty array", async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify([
        {
          id: "x1",
          vagaId: "v1",
          vagaTitle: "T",
          title: "t",
          body: "b",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ])
    );

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(1);
    });

    fireEvent.press(screen.getByTestId("clearAll"));

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(0);
    });

    expect(mockSetItem).toHaveBeenCalledWith("@app_notifications", "[]");
  });

  it("caps notifications list at 50 items", async () => {
    const stored = Array.from({ length: 50 }, (_, i) => ({
      id: `id-${i}`,
      vagaId: "v1",
      vagaTitle: "T",
      title: "t",
      body: "b",
      read: true,
      createdAt: new Date().toISOString(),
    }));
    mockGetItem.mockResolvedValueOnce(JSON.stringify(stored));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(50);
    });

    fireEvent.press(screen.getByTestId("add"));

    await waitFor(() => {
      expect(screen.getByTestId("count").props.children).toBe(50);
    });
  });
});
