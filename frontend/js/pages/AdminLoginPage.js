import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AdminLoginForm } from '../components/AdminLoginForm.js';
import { Toast } from '../components/Toast.js';
import { setAdminSession } from '../utils/auth.js';

mountChrome();
const host = appHost();

new AdminLoginForm({
  onSubmit: async (data) => {
    try {
      const { token, admin } = await api.post('/auth/login', data);
      setAdminSession(token, admin);
      Toast.show('Admin signed in');
      window.location.href = 'admin-dashboard.html';
    } catch (e) {
      Toast.show(e.message || 'Login failed', 'danger');
    }
  },
}).mount(host);
