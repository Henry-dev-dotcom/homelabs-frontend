import { roles } from '../data/dashboardData.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

export const roleToDemoEmail = {
  operations: 'operations@homelabs.gh',
  admin: 'admin@homelabs.gh',
  patient: 'patient@example.com',
  clinician: 'clinician@example.com',
  phlebotomist: 'phlebotomist@homelabs.gh',
  lab: 'lab@homelabs.gh'
};

export function roleToApiRole(role) {
  const map = {
    operations: 'OPERATIONS',
    admin: 'ADMIN',
    patient: 'PATIENT',
    clinician: 'CLINICIAN',
    phlebotomist: 'PHLEBOTOMIST',
    lab: 'HOMELABS_LAB_STAFF'
  };
  return map[role] || String(role || 'operations').toUpperCase();
}

export function apiRoleToClientRole(role) {
  const normalised = String(role || '').trim();
  const upper = normalised.toUpperCase();
  const lower = normalised.toLowerCase();
  const directClientRoles = ['admin', 'operations', 'patient', 'clinician', 'phlebotomist', 'lab'];
  if (directClientRoles.includes(lower)) return lower;
  const map = {
    SUPER_ADMIN: 'admin',
    ADMIN: 'admin',
    OPERATIONS: 'operations',
    DISPATCHER: 'operations',
    CUSTOMER_SUPPORT: 'operations',
    FINANCE: 'admin',
    PHLEBOTOMIST: 'phlebotomist',
    HOMELABS_LAB_STAFF: 'lab',
    PARTNER_LAB_STAFF: 'lab',
    CLINICIAN: 'clinician',
    HOSPITAL_PARTNER: 'clinician',
    PATIENT: 'patient'
  };
  return map[upper] || 'patient';
}

export async function login({ email, password = 'password123', role }) {
  const selectedRole = roles.find((item) => item.id === role) || roles[0];

  if (!USE_MOCKS) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      ...jsonBody({
        email: email || roleToDemoEmail[selectedRole.id],
        password,
        role: roleToApiRole(selectedRole.id)
      })
    });
    localStorage.setItem('homelabs_token', result.token);
    localStorage.setItem('homelabs_user', JSON.stringify(result.user));
    return {
      ...result,
      user: {
        ...result.user,
        role: apiRoleToClientRole(result.user.role)
      }
    };
  }

  localStorage.setItem('homelabs_token', 'mock-homelabs-token');
  const user = {
    id: `USER-${selectedRole.id.toUpperCase()}`,
    name: selectedRole.name,
    email: email || roleToDemoEmail[selectedRole.id] || `${selectedRole.id}@homelabs.gh`,
    role: selectedRole.id
  };
  localStorage.setItem('homelabs_user', JSON.stringify(user));
  return mockResponse({ token: 'mock-homelabs-token', user });
}

export function logout() {
  localStorage.removeItem('homelabs_token');
  localStorage.removeItem('homelabs_user');
}

export async function getSession(role = 'operations') {
  if (!USE_MOCKS) {
    const result = await apiRequest('/auth/me');
    return { authenticated: true, role: apiRoleToClientRole(result.user.role), name: result.user.name, user: result.user };
  }

  const selectedRole = roles.find((item) => item.id === role) || roles[0];
  return mockResponse({ authenticated: true, role: selectedRole.id, name: selectedRole.name });
}
