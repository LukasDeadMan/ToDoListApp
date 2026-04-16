import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { tasksApi } from "./services/tasks";
import { usersApi } from "./services/users";

jest.mock("./services/users", () => {
  const usersApi = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return {
    usersApi,
  };
});

jest.mock("./services/tasks", () => {
  const tasksApi = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return {
    tasksApi,
  };
});

const authenticatedUser = {
  id: 7,
  username: "Lucas",
  nickname: "lucas",
  email: "lucas@example.com",
};

const initialTasks = [
  {
    id: 11,
    title: "Revisar backlog da semana",
    done: false,
    created_at: "2026-04-15T10:00:00",
    user_id: 7,
  },
  {
    id: 12,
    title: "Fechar resumo do projeto",
    done: true,
    created_at: "2026-04-14T14:30:00",
    user_id: 7,
  },
];

function renderAt(pathname = "/") {
  window.history.pushState({}, "", pathname);
  return render(<App />);
}

function mockAnonymousSession() {
  usersApi.me.mockRejectedValue({
    status: 401,
    message: "unauthorized",
  });
}

function mockAuthenticatedSession({
  user = authenticatedUser,
  tasks = initialTasks,
} = {}) {
  usersApi.me.mockResolvedValue(user);
  tasksApi.list.mockResolvedValue(tasks);
}

beforeAll(() => {
  window.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.resetAllMocks();
  window.history.pushState({}, "", "/");
  window.scrollTo = jest.fn();
});

describe("App smoke flows", () => {
  test("renders the public home and navigates to login and register", async () => {
    mockAnonymousSession();

    renderAt("/");

    expect(
      await screen.findByRole("heading", {
        name: /clareza para planejar o dia/i,
      })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "Entrar" }));

    expect(
      await screen.findByRole("heading", {
        name: /acesse seu painel/i,
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");

    await userEvent.click(
      within(screen.getByRole("main")).getByRole("link", {
        name: /criar conta/i,
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: /abra seu workspace em poucos segundos/i,
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/register");
  });

  test("redirects anonymous users away from protected routes", async () => {
    mockAnonymousSession();

    renderAt("/tasks");

    expect(
      await screen.findByRole("heading", {
        name: /acesse seu painel/i,
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
    expect(tasksApi.list).not.toHaveBeenCalled();
  });

  test("loads the authenticated dashboard and creates a new task", async () => {
    mockAuthenticatedSession();
    tasksApi.create.mockResolvedValue({
      id: 99,
      title: "Nova tarefa de smoke test",
      done: false,
      created_at: "2026-04-15T12:00:00",
      user_id: authenticatedUser.id,
    });

    renderAt("/");

    expect(
      await screen.findByRole("heading", {
        name: /lucas, suas tarefas/i,
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/tasks");
    expect(await screen.findByText(/revisar backlog da semana/i)).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText(/titulo da tarefa/i),
      "Nova tarefa de smoke test"
    );
    await userEvent.click(screen.getByRole("button", { name: /criar tarefa/i }));

    await waitFor(() => {
      expect(tasksApi.create).toHaveBeenCalledWith({
        title: "Nova tarefa de smoke test",
      });
    });

    expect(
      await screen.findByText(/nova tarefa de smoke test/i)
    ).toBeInTheDocument();
  });

  test("submits the register flow and opens the dashboard", async () => {
    mockAnonymousSession();
    usersApi.register.mockResolvedValue({
      id: 18,
      username: "Teste QA",
      nickname: "teste-qa",
      email: "teste@example.com",
    });
    usersApi.login.mockResolvedValue({
      message: "login successful",
      user: {
        id: 18,
        username: "Teste QA",
        nickname: "teste-qa",
        email: "teste@example.com",
      },
    });
    tasksApi.list.mockResolvedValue([]);

    renderAt("/register");

    expect(
      await screen.findByRole("heading", {
        name: /abra seu workspace em poucos segundos/i,
      })
    ).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^nome$/i), "Teste QA");
    await userEvent.type(screen.getByLabelText(/^nickname$/i), "teste-qa");
    await userEvent.type(screen.getByLabelText(/^email$/i), "teste@example.com");
    await userEvent.type(screen.getByLabelText(/^senha$/i), "Teste123!");
    await userEvent.type(screen.getByLabelText(/^confirmacao$/i), "Teste123!");
    await userEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(usersApi.register).toHaveBeenCalledWith({
        username: "Teste QA",
        nickname: "teste-qa",
        email: "teste@example.com",
        password: "Teste123!",
      });
    });

    expect(usersApi.login).toHaveBeenCalledWith({
      email: "teste@example.com",
      password: "Teste123!",
    });
    expect(await screen.findByText(/conta criada e sessao iniciada/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /teste qa, suas tarefas/i,
      })
    ).toBeInTheDocument();
  });

  test("logs out an authenticated user and returns to the home page", async () => {
    mockAuthenticatedSession({ tasks: [] });
    usersApi.logout.mockResolvedValue({
      message: "logout successful",
    });

    renderAt("/tasks");

    expect(
      await screen.findByRole("heading", {
        name: /lucas, suas tarefas/i,
      })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /sair/i }));

    await waitFor(() => {
      expect(usersApi.logout).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("heading", {
        name: /clareza para planejar o dia/i,
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });
});
