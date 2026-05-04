import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AuthForm } from '../components/AuthForm.js';
import { Toast } from '../components/Toast.js';
import { setUserSession } from '../utils/auth.js';

mountChrome();
const host = appHost();

new AuthForm({
  mode: 'register',
  onSubmit: async (data) => {
    try {
      const { token, user } = await api.post('/users/register', data);
      setUserSession(token, user);
      Toast.show(`Welcome, ${user.name}!`);
      window.location.href = 'index.html';
    } catch (e) {
      Toast.show(e.message || 'Registration failed', 'danger');
    }
  },
}).mount(host);
