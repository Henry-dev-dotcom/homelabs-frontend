import { roles } from '../data/dashboardData.js';
import { apiRequest, jsonBody } from './apiClient.js';

export function roleToApiRole(role) {
  const map = {
    operations: 'OPERATIONS',
    admin: 'ADMIN',
    patient: 'PATIENT',
    clinician: 'CLINICIAN',
    phlebotomist: 'PHLEBOTOMIST',
    lab: 'HOMELABS_LAB_STAFF'
  };
  return map[role] || String(role || 'patient').toUpperCase();
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

function storeAuthResult(result) {
  sessionStorage.removeItem('homelabs_token');
  sessionStorage.removeItem('homelabs_user');
  localStorage.removeItem('homelabs_token');
  localStorage.removeItem('homelabs_user');
  sessionStorage.setItem('homelabs_token', result.token);
  sessionStorage.setItem('homelabs_user', JSON.stringify(result.user));
  return {
    ...result,
    user: {
      ...result.user,
      role: apiRoleToClientRole(result.user.role)
    }
  };
}

export async function login({ email, password, role }) {
  const selectedRole = roles.find((item) => item.id === role) || roles.find((item) => item.id === 'patient') || roles[0];
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    ...jsonBody({
      email,
      password,
      role: roleToApiRole(selectedRole.id)
    })
  });
  return storeAuthResult(result);
}

export async function googleLogin({ credential, role }) {
  const selectedRole = roles.find((item) => item.id === role) || roles.find((item) => item.id === 'patient') || roles[0];
  const result = await apiRequest('/auth/google', {
    method: 'POST',
    ...jsonBody({
      credential,
      role: roleToApiRole(selectedRole.id)
    })
  });
  return storeAuthResult(result);
}

export function logout() {
  sessionStorage.removeItem('homelabs_token');
  sessionStorage.removeItem('homelabs_user');
  localStorage.removeItem('homelabs_token');
  localStorage.removeItem('homelabs_user');
}

export async function getSession() {
  const result = await apiRequest('/auth/me');
  return { authenticated: true, role: apiRoleToClientRole(result.user.role), name: result.user.name, user: result.user };
}
