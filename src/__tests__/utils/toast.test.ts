import { toast } from "@/utils/toast";

const mockShow = jest.fn();

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: (...args: unknown[]) => mockShow(...args) },
}));

beforeEach(() => {
  mockShow.mockClear();
});

describe("toast.success", () => {
  it("deve chamar Toast.show com type success e visibilityTime 3000", () => {
    toast.success("Operação realizada!");

    expect(mockShow).toHaveBeenCalledWith({
      type: "success",
      text1: "Operação realizada!",
      visibilityTime: 3000,
    });
  });
});

describe("toast.error", () => {
  it("deve chamar Toast.show com type error e visibilityTime 4000", () => {
    toast.error("Algo deu errado.");

    expect(mockShow).toHaveBeenCalledWith({
      type: "error",
      text1: "Algo deu errado.",
      visibilityTime: 4000,
    });
  });
});

describe("toast.info", () => {
  it("deve chamar Toast.show com type info e visibilityTime 3000", () => {
    toast.info("Informação importante.");

    expect(mockShow).toHaveBeenCalledWith({
      type: "info",
      text1: "Informação importante.",
      visibilityTime: 3000,
    });
  });
});
