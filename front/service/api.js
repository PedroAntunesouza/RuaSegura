const BASE_URL = "http://192.168.1.138:8081";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorMessage = body?.message || text || response.statusText;
    throw new Error(errorMessage);
  }

  return body;
}

export async function createUser(user) {
  return request('/user/create', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function loginUser(user) {
  return request('/user/login', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function createReport(report, email) {
  const query = email ? `?email=${encodeURIComponent(email)}` : '';
  return request(`/visit/create${query}`, {
    method: 'POST',
    body: JSON.stringify(report),
  });
}

export async function getReports() {
  return request('/visit/returnAll', {
    method: 'GET',
  });
}

export async function getReportsByAuthor(author) {
  return request(`/visit/list?author=${encodeURIComponent(author)}`, {
    method: 'GET',
  });
}

export default {
  createUser,
  loginUser,
  createReport,
  getReports,
  getReportsByAuthor,
};