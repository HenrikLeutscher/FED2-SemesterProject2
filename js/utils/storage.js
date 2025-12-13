import { API_KEY } from "../config.js";

export function saveToken(token) {
  localStorage.setItem("accessToken", token);
}

export function getToken() {
    return localStorage.getItem("accessToken");
}

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function removeToken() {
  localStorage.removeItem("accessToken");
}

export function removeUser() {
  localStorage.removeItem("user");
}

export function getApiKey() {
    return API_KEY;
}