import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AuthForm } from '../components/AuthForm.js';
import { Toast } from '../components/Toast.js';
import { setUserSession } from '../utils/auth.js';

mountChrome();
const host = appHost();

new AuthForm({
  mode: 'login',
  onSubmit: async (data) => {
    try {
      const { token, user } = await api.post('/users/login', data);
      setUserSession(token, user);
      Toast.show(`Welcome back, ${user.name}!`);
      window.location.href = 'index.html';
    } catch (e) {
      Toast.show(e.message || 'Login failed', 'danger');
    }
  },
}).mount(host);
