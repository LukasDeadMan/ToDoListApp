const ROUTES = [
  { name: "home", path: "/", protected: false },
  { name: "login", path: "/login", protected: false },
  { name: "register", path: "/register", protected: false },
  { name: "tasks", path: "/tasks", protected: true },
  { name: "taskNew", path: "/tasks/new", protected: true },
  { name: "taskEdit", path: "/tasks/:taskId/edit", protected: true },
  { name: "profile", path: "/profile", protected: true },
];

function splitSegments(pathname) {
  return pathname.split("/").filter(Boolean);
}

function matchPattern(pattern, pathname) {
  const patternSegments = splitSegments(pattern);
  const pathSegments = splitSegments(pathname);

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = pathSegment;
      continue;
    }

    if (patternSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

export function normalizePath(pathname = "/") {
  if (!pathname) {
    return "/";
  }

  const cleanPath = pathname.replace(/\/+$/, "");
  if (!cleanPath) {
    return "/";
  }

  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
}

export function matchRoute(pathname) {
  const normalizedPath = normalizePath(pathname);

  for (const route of ROUTES) {
    const params = matchPattern(route.path, normalizedPath);

    if (params) {
      return {
        ...route,
        params,
        normalizedPath,
      };
    }
  }

  return {
    name: "notFound",
    path: normalizedPath,
    params: {},
    protected: false,
    normalizedPath,
  };
}

export const routePaths = {
  home: "/",
  login: "/login",
  register: "/register",
  tasks: "/tasks",
  newTask: "/tasks/new",
  profile: "/profile",
  editTask(taskId) {
    return `/tasks/${taskId}/edit`;
  },
};
