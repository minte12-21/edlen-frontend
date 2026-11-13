export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const img = (u) => (!u ? null : u.startsWith('http') ? u : API_URL + u);

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('edlen_token'));
export const setToken = (t) => (t ? localStorage.setItem('edlen_token', t) : localStorage.removeItem('edlen_token'));

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method, headers, body: payload });
  } catch {
    throw new Error('Cannot reach the server. Check your internet and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong.'), { status: res.status });
  return data;
}

// Download a file (used for the Excel export)
export async function download(path, fallbackName) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Export failed.');
  const name = (res.headers.get('content-disposition') || '').match(/filename="(.+?)"/)?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
