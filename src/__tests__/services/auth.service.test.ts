import { authService } from "@/services/auth.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authService.register", () => {
  it("deve chamar POST /v1/users/register com payload correto (sem persona/module)", async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { accessToken: "access-token", refreshToken: "refresh-token" },
    });

    await authService.register({
      name: "João Silva",
      email: "joao@email.com",
      password: "Senha123!",
      phoneNumber: "+5511999999999",
    });

    expect(mockApi.post).toHaveBeenCalledWith("/v1/users/register", {
      name: "João Silva",
      email: "joao@email.com",
      password: "Senha123!",
      phoneNumber: "+5511999999999",
    });
  });

  it("deve retornar accessToken e refreshToken no registro", async () => {
    const mockTokens = { accessToken: "access-token", refreshToken: "refresh-token" };
    mockApi.post.mockResolvedValueOnce({ data: mockTokens });

    const result = await authService.register({
      name: "João Silva",
      email: "joao@email.com",
      password: "Senha123!",
    });

    expect(result.data.accessToken).toBe("access-token");
    expect(result.data.refreshToken).toBe("refresh-token");
  });
});

describe("authService.login", () => {
  it("deve chamar POST /v1/users/login com payload correto", async () => {
    const mockResponse = {
      data: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "1", name: "João", email: "joao@email.com", profileCompleted: true },
      },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);

    const result = await authService.login({ email: "joao@email.com", password: "senha123" });

    expect(mockApi.post).toHaveBeenCalledWith("/v1/users/login", {
      email: "joao@email.com",
      password: "senha123",
    });
    expect(result.data.accessToken).toBe("access-token");
  });
});

describe("authService.me", () => {
  it("deve chamar GET /v1/users/me", async () => {
    const mockUser = { id: "1", name: "João", email: "joao@email.com", profileCompleted: true };
    mockApi.get.mockResolvedValueOnce({ data: mockUser });

    const result = await authService.me();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/users/me");
    expect(result.data).toEqual(mockUser);
  });
});

describe("authService.confirmEmail", () => {
  it("deve chamar POST /v1/users/confirm-email com payload correto", async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await authService.confirmEmail({ email: "joao@email.com", code: "123456" });

    expect(mockApi.post).toHaveBeenCalledWith("/v1/users/confirm-email", {
      email: "joao@email.com",
      code: "123456",
    });
  });
});

describe("authService.resendConfirmationCode", () => {
  it("deve chamar GET com o email na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: {} });

    await authService.resendConfirmationCode("joao@email.com");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/users/generate-email-confirmation-code/joao@email.com"
    );
  });
});

describe("authService.forgotPassword", () => {
  it("deve chamar POST /v1/users/forgot-password com email", async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await authService.forgotPassword({ email: "joao@email.com" });

    expect(mockApi.post).toHaveBeenCalledWith("/v1/users/forgot-password", {
      email: "joao@email.com",
    });
  });
});

describe("authService.resetPassword", () => {
  it("deve chamar POST /v1/users/reset-password com payload completo", async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await authService.resetPassword({
      email: "joao@email.com",
      code: "123456",
      password: "novaSenha123",
    });

    expect(mockApi.post).toHaveBeenCalledWith("/v1/users/reset-password", {
      email: "joao@email.com",
      code: "123456",
      password: "novaSenha123",
    });
  });
});
