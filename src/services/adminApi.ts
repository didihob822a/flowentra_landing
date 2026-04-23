// Admin CMS API Service — all operations go through the PHP backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://luccibyey.com.tn/flowentra/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'editor';
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

interface CmsSection {
  section_key: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: number;
}

interface CmsField {
  field_key: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'number' | 'rich_text' | 'image' | 'json';
  is_array: number;
  array_max_items: number | null;
  sort_order: number;
  placeholder: string | null;
  is_required: number;
}

interface ContentItem {
  section: string;
  key: string;
  lang: string;
  value: string;
  type?: string;
}

interface ChangeLogEntry {
  section: string;
  content_key: string;
  lang: string;
  old_value: string | null;
  new_value: string;
  changed_at: string;
  changed_by_name: string;
}

// Token management — always read fresh from localStorage to avoid stale closures
function getHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `API error: ${response.status}`);
  return data;
}

// ==================== AUTH ====================

export const adminAuth = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Hardcoded admin — no server round-trip needed
    const user: AdminUser = { id: 1, email: 'admin@flowentra.io', name: 'Admin', role: 'super_admin' };
    localStorage.setItem('admin_user', JSON.stringify(user));
    return { success: true, token: 'static', user };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('admin_user');
  },

  async verify(): Promise<ApiResponse<AdminUser>> {
    const user: AdminUser = { id: 1, email: 'admin@flowentra.io', name: 'Admin', role: 'super_admin' };
    return { success: true, data: user };
  },

  async updateProfile(data: { name?: string; password?: string }): Promise<ApiResponse<AdminUser>> {
    return apiCall('/auth.php?action=profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStoredUser(): AdminUser | null {
    return { id: 1, email: 'admin@flowentra.io', name: 'Admin', role: 'super_admin' };
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_user');
  },
};

// ==================== CONTENT ====================

export const adminContent = {
  async getSections(): Promise<CmsSection[]> {
    const result = await apiCall<ApiResponse<CmsSection[]>>('/content.php?action=sections');
    return result.data || [];
  },

  async getFields(sectionKey: string): Promise<CmsField[]> {
    const result = await apiCall<ApiResponse<CmsField[]>>(`/content.php?action=fields&section=${sectionKey}`);
    return result.data || [];
  },

  async getSectionContent(section: string, lang: string): Promise<Record<string, { value: string; type: string }>> {
    const result = await apiCall<ApiResponse<Record<string, { value: string; type: string }>>>(`/content.php?action=get_section&section=${section}&lang=${lang}`);
    return result.data || {};
  },

  async getAllContent(): Promise<Record<string, Record<string, Record<string, string>>>> {
    const result = await apiCall<ApiResponse<Record<string, Record<string, Record<string, string>>>>>('/content.php?action=get_all');
    return result.data || {};
  },

  async saveContent(section: string, key: string, lang: string, value: string, type = 'text'): Promise<ApiResponse> {
    return await apiCall<ApiResponse>('/content.php?action=save', {
      method: 'POST',
      body: JSON.stringify({ section, key, lang, value, type }),
    });
  },

  async saveBulk(items: ContentItem[]): Promise<ApiResponse> {
    return await apiCall<ApiResponse>('/content.php?action=save_bulk', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async getHistory(section?: string, limit = 50): Promise<ChangeLogEntry[]> {
    const params = new URLSearchParams({ action: 'history', limit: String(limit) });
    if (section) params.append('section', section);
    const result = await apiCall<ApiResponse<ChangeLogEntry[]>>(`/content.php?${params}`);
    return result.data || [];
  },

  async exportContent(): Promise<any> {
    return await apiCall('/content.php?action=export');
  },

  async importContent(data: any[]): Promise<ApiResponse> {
    return await apiCall('/content.php?action=import', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },
};

// ==================== MEDIA ====================

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  thumb_path: string | null;
  image_url: string;
  thumb_url: string | null;
  mime_type: string;
  file_size: number;
  dimensions: string | null;
  category: 'hero' | 'logo' | 'icon' | 'integration' | 'screenshot' | 'general';
  section_key: string | null;
  alt_text: string;
  uploaded_by: number | null;
  created_at: string;
}

interface MediaListResponse {
  data: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminMedia = {
  async upload(
    file: File,
    category: string = 'general',
    altText: string = '',
    section?: string
  ): Promise<ApiResponse<MediaFile>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    formData.append('alt_text', altText);
    if (section) formData.append('section', section);

    const response = await fetch(`${API_BASE}/media.php?action=upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async list(category?: string, section?: string, page = 1, limit = 50): Promise<MediaListResponse> {
    const params = new URLSearchParams({ action: 'list', page: String(page), limit: String(limit) });
    if (category) params.append('category', category);
    if (section) params.append('section', section);
    const result = await apiCall<MediaListResponse>(`/media.php?${params}`);
    return result;
  },

  async get(id: number): Promise<MediaFile | null> {
    const result = await apiCall<ApiResponse<MediaFile>>(`/media.php?action=get&id=${id}`);
    return result.data || null;
  },

  async delete(id: number): Promise<ApiResponse> {
    return await apiCall('/media.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  async replace(id: number, file: File): Promise<ApiResponse<MediaFile>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('id', String(id));

    const response = await fetch(`${API_BASE}/media.php?action=replace`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },
};

export type { AdminUser, CmsSection, CmsField, ContentItem, ChangeLogEntry, MediaFile };
