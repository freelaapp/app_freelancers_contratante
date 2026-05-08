import React from "react";
import { Text } from "react-native";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { CenteredModal } from "@/components/centered-modal";

jest.mock("@/constants/theme", () => ({
  radii: { "2xl": 20 },
}));

describe("CenteredModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza sem crash quando visible é false", () => {
    render(
      <CenteredModal visible={false} onClose={onClose}>
        <Text>Conteúdo</Text>
      </CenteredModal>
    );
  });

  it("renderiza sem crash quando visible é true", () => {
    render(
      <CenteredModal visible onClose={onClose}>
        <Text>Conteúdo</Text>
      </CenteredModal>
    );
  });

  it("exibe o conteúdo filho quando visible é true", () => {
    render(
      <CenteredModal visible onClose={onClose}>
        <Text>Texto interno do modal</Text>
      </CenteredModal>
    );
    expect(screen.getByText("Texto interno do modal")).toBeTruthy();
  });

  it("chama onClose ao pressionar o backdrop", () => {
    const { UNSAFE_root } = render(
      <CenteredModal visible onClose={onClose}>
        <Text>Conteúdo</Text>
      </CenteredModal>
    );

    function findPressables(node: { props?: { onPress?: unknown }; children?: unknown[] }): { props?: { onPress?: unknown }; children?: unknown[] }[] {
      const results: { props?: { onPress?: unknown }; children?: unknown[] }[] = [];
      if (node.props?.onPress) results.push(node);
      if (node.children) {
        node.children.forEach((child: unknown) => {
          results.push(...findPressables(child as { props?: { onPress?: unknown }; children?: unknown[] }));
        });
      }
      return results;
    }

    const pressables = findPressables(UNSAFE_root);
    expect(pressables.length).toBeGreaterThanOrEqual(1);
    fireEvent.press(pressables[0] as Parameters<typeof fireEvent.press>[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não fecha o modal ao pressionar o conteúdo interno", () => {
    const { UNSAFE_root } = render(
      <CenteredModal visible onClose={onClose}>
        <Text>Conteúdo</Text>
      </CenteredModal>
    );

    function findPressables(node: { props?: { onPress?: unknown }; children?: unknown[] }): { props?: { onPress?: unknown }; children?: unknown[] }[] {
      const results: { props?: { onPress?: unknown }; children?: unknown[] }[] = [];
      if (node.props?.onPress) results.push(node);
      if (node.children) {
        node.children.forEach((child: unknown) => {
          results.push(...findPressables(child as { props?: { onPress?: unknown }; children?: unknown[] }));
        });
      }
      return results;
    }

    const pressables = findPressables(UNSAFE_root);
    // O segundo Pressable (conteúdo interno) não tem onPress — apenas o backdrop tem
    expect(pressables.length).toBe(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
