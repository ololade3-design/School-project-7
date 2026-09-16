(() => {
  'use strict';

  const API_BASE_URL = 'https://school-project-7-ripv.onrender.com/api';
  const TOKEN_KEY = 'authToken';
  const USER_KEY = 'loggedInUser';
  const dashboards = {
    admin: '/Admin%20dashboard/dashboard.html',
    student: '/Student%20dashboard/student%20dashboard.html',
    lecturer: '/Lecturer%20dashboard/lecturer%20dashboard.html'
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  };
  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };
  const redirectToLogin = () => { window.location.href = '/Student%20dashboard/login.html'; };
  const redirectForRole = (role) => { window.location.href = dashboards[role] || '/Student%20dashboard/login.html'; };

  const showMessage = (message, type = 'error') => {
    let node = document.getElementById('apiMessage') || document.getElementById('registrationMessage');
    if (!node) {
      node = document.createElement('p');
      node.id = 'apiMessage';
      const form = document.querySelector('form') || document.querySelector('.main') || document.body;
      form.prepend(node);
    }
    node.textContent = message;
    node.style.color = type === 'success' ? '#15803d' : '#b91c1c';
    node.style.margin = '12px 0';
  };

  const apiRequest = async (path, options = {}) => {
    const method = options.method || 'GET';
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
      });
    } catch {
      const error = new Error('Unable to reach the server. Confirm that the backend is running.');
      error.status = 0;
      throw error;
    }

    const payload = await response.json().catch(() => ({ success: false, message: 'Invalid server response.' }));
    if (!response.ok || payload.success === false) {
      const error = new Error(payload.message || 'Request failed.');
      error.status = response.status;
      if (response.status === 401 && !path.startsWith('/auth/')) {
        clearSession();
        redirectToLogin();
      }
      throw error;
    }
    return payload;
  };

  const api = {
    request: apiRequest,
    get: (path) => apiRequest(path),
    post: (path, body) => apiRequest(path, { method: 'POST', body }),
    put: (path, body) => apiRequest(path, { method: 'PUT', body }),
    delete: (path) => apiRequest(path, { method: 'DELETE' }),
    getToken,
    getUser,
    clearSession,
    logout: () => { clearSession(); window.location.href = '/Student%20dashboard/login.html'; }
  };
  window.SmartTimetableAPI = api;

  const normalizeRole = (role) => ({ administrator: 'admin', admin: 'admin', student: 'student', lecturer: 'lecturer' }[String(role || '').trim().toLowerCase()]);
  const field = (id) => document.getElementById(id)?.value.trim() || '';

  const isPublicPage = () => /(?:^|\/)(index|login|register|student-register|admin-register)\.html$/i.test(window.location.pathname);
  const guardPage = () => {
    if (isPublicPage()) return;
    const user = getUser();
    if (!getToken() || !user?.role) return redirectToLogin();
    const page = decodeURIComponent(window.location.pathname).toLowerCase();
    const expectedRole = page.includes('admin dashboard') ? 'admin' : page.includes('student dashboard') ? 'student' : page.includes('lecturer dashboard') ? 'lecturer' : null;
    if (expectedRole && user.role !== expectedRole) redirectForRole(user.role);
  };

  const bindLogin = () => {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const requestedRole = normalizeRole(field('role'));
      try {
        showMessage('Signing in...', 'success');
        const response = await api.post('/auth/login', { email: field('email'), password: document.getElementById('password')?.value || '' });
        const { token, user } = response.data;
        if (requestedRole && user.role !== requestedRole) throw new Error(`This account is registered as ${user.role}.`);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        redirectForRole(user.role);
      } catch (error) { showMessage(error.message); }
    });
  };

  const bindRegistration = () => {
    const form = document.getElementById('studentRegistrationForm') || document.getElementById('registerForm');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const password = document.getElementById('password')?.value || '';
        const confirmation = document.getElementById('confirmPassword')?.value || document.getElementById('confirm')?.value || password;
        if (password !== confirmation) return showMessage('Passwords do not match.');
        const page = decodeURIComponent(window.location.pathname).toLowerCase();
        const role = page.includes('lecturer dashboard') ? 'lecturer' : 'student';
        try {
          showMessage('Creating account...', 'success');
          await api.post('/auth/register', {
            fullName: field('fullName') || field('name'),
            email: field('email'),
            password,
            role
          });
          showMessage('Registration successful. Please sign in.', 'success');
          setTimeout(redirectToLogin, 700);
        } catch (error) { showMessage(error.message); }
      }, true);
    }

    const adminForm = document.getElementById('adminRegistrationForm');
    if (adminForm) adminForm.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showMessage('Administrator accounts can only be created with the secure server seed command.');
    }, true);
  };

  const adminConfigs = {
    'students.html': {
      endpoint: '/students', button: 'saveStudent', table: 'studentTable',
      payload: () => ({ matricNumber: field('matric'), fullName: field('fullname'), email: field('email'), phone: field('phone'), department: field('department'), level: field('level') }),
      fields: (item) => ({ matric: item.matricNumber, fullname: item.fullName, email: item.email, phone: item.phone, department: item.department, level: item.level }),
      row: (item, index) => [index + 1, item.matricNumber, item.fullName, '—', item.level || '—', item.department || '—', item.email, item.phone || '—']
    },
    'lecturers.html': {
      endpoint: '/lecturers', button: 'saveLecturer', table: 'lecturerTable',
      payload: () => ({ staffId: field('staffId'), fullName: field('name'), email: field('email'), phone: field('phone'), department: field('department') }),
      fields: (item) => ({ staffId: item.staffId, name: item.fullName, email: item.email, phone: item.phone, department: item.department }),
      row: (item, index) => [index + 1, item.staffId, item.fullName, '—', item.department || '—', item.email, item.phone || '—']
    },
    'courses.html': {
      endpoint: '/courses', button: 'saveCourse', table: 'courseTable',
      payload: () => ({ courseCode: field('code'), courseTitle: field('title'), units: Number(field('unit')), level: field('level'), semester: field('semester') }),
      fields: (item) => ({ code: item.courseCode, title: item.courseTitle, unit: item.units, level: item.level, semester: item.semester }),
      row: (item, index) => [index + 1, item.courseCode, item.courseTitle, item.units, item.level, item.semester]
    },
    'departments.html': {
      endpoint: '/departments', button: 'saveDepartment', table: 'departmentTable',
      payload: () => ({ code: field('departmentCode'), name: field('departmentName'), faculty: field('faculty'), headOfDepartment: field('hod') }),
      fields: (item) => ({ departmentCode: item.code, departmentName: item.name, faculty: item.faculty, hod: item.headOfDepartment }),
      row: (item, index) => [index + 1, item.code, item.name, item.faculty, item.headOfDepartment || '—']
    },
    'lecture rooms.html': {
      endpoint: '/lecture-rooms', button: 'saveRoom', table: 'roomTable',
      payload: () => ({ roomNumber: field('roomCode'), roomName: field('roomName'), capacity: Number(field('capacity')), building: field('building'), status: ({ available: 'available', occupied: 'unavailable', maintenance: 'maintenance' }[field('status').toLowerCase()] || 'available') }),
      fields: (item) => ({ roomCode: item.roomNumber, roomName: item.roomName, capacity: item.capacity, building: item.building, status: item.status }),
      row: (item, index) => [index + 1, item.roomNumber, item.roomName, item.capacity, item.building, item.status]
    }
  };

  const bindAdminCrud = () => {
    const config = adminConfigs[decodeURIComponent(window.location.pathname).split('/').pop().toLowerCase()];
    if (!config) return;
    const table = document.getElementById(config.table);
    const button = document.getElementById(config.button);
    if (!table || !button) return;
    let records = [];
    let editingId = null;

    const render = () => {
      if (!records.length) { table.innerHTML = `<tr><td colspan="10">No records available.</td></tr>`; return; }
      table.innerHTML = records.map((item, index) => `<tr>${config.row(item, index).map((value) => `<td>${value ?? '—'}</td>`).join('')}<td><button data-api-action="edit" data-api-id="${item._id}">Edit</button> <button data-api-action="delete" data-api-id="${item._id}">Delete</button></td></tr>`).join('');
    };
    const load = async () => {
      try { showMessage('Loading records...', 'success'); records = (await api.get(config.endpoint)).data; render(); showMessage(''); }
      catch (error) { showMessage(error.message || 'Unable to load data.'); }
    };
    document.addEventListener('click', async (event) => {
      const save = event.target.closest(`#${config.button}`);
      const action = event.target.closest('[data-api-action]');
      if (!save && !action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        if (save) {
          showMessage('Saving...', 'success');
          const payload = config.payload();
          const response = editingId ? await api.put(`${config.endpoint}/${editingId}`, payload) : await api.post(config.endpoint, payload);
          const index = records.findIndex((record) => record._id === response.data._id);
          if (index >= 0) records[index] = response.data; else records.push(response.data);
          editingId = null;
          render();
          showMessage('Saved successfully.', 'success');
          document.getElementById('formBox')?.querySelectorAll('input').forEach((input) => { input.value = ''; });
          return;
        }
        const record = records.find((item) => item._id === action.dataset.apiId);
        if (!record) return;
        if (action.dataset.apiAction === 'delete') {
          if (!window.confirm('Delete this record?')) return;
          await api.delete(`${config.endpoint}/${record._id}`);
          records = records.filter((item) => item._id !== record._id);
          render(); showMessage('Deleted successfully.', 'success'); return;
        }
        editingId = record._id;
        Object.entries(config.fields(record)).forEach(([id, value]) => { const input = document.getElementById(id); if (input) input.value = value || ''; });
        document.getElementById('formBox').style.display = 'block';
      } catch (error) { showMessage(error.message); }
    }, true);
    load();
  };

  const bindLogout = () => document.querySelectorAll('a').forEach((link) => {
    if (link.textContent.trim().toLowerCase().includes('logout')) link.addEventListener('click', (event) => { event.preventDefault(); api.logout(); });
  });

  const hydratePortalSession = async () => {
    if (!getToken() || isPublicPage()) return;
    try {
      const currentUser = (await api.get('/auth/me')).data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      document.querySelectorAll('#studentName, #welcomeName, #headerLecturerName, #lecturerName, #profileName').forEach((node) => {
        node.textContent = currentUser.fullName;
      });

      const resources = currentUser.role === 'student'
        ? ['courses', 'timetable', 'course-registrations', 'notifications', 'course-materials']
        : currentUser.role === 'lecturer'
          ? ['courses', 'timetable', 'course-registrations', 'notifications', 'course-materials']
          : [];
      const responses = await Promise.allSettled(resources.map((resource) => api.get(`/${resource}`)));
      const data = resources.reduce((result, resource, index) => {
        if (responses[index].status === 'fulfilled') result[resource] = responses[index].value.data;
        return result;
      }, {});
      window.dispatchEvent(new CustomEvent('smarttimetable:data', { detail: data }));
    } catch (error) {
      if (error.status !== 401) showMessage(error.message || 'Unable to load data.');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    guardPage();
    bindLogin();
    bindRegistration();
    bindAdminCrud();
    bindLogout();
    hydratePortalSession();
  });
})();
