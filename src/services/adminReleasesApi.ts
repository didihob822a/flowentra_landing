const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://luccibyey.com.tn/flowentra/api';

function getHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers: { ...getHeaders(), ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `API error: ${response.status}`);
  return data;
}

export interface ReleaseItem {
  id?: number;
  item_type: 'feature' | 'bugfix' | 'improvement';
  sort_order?: number;
  texts: Record<string, string>; // { en: "...", fr: "...", ... }
}

export interface Release {
  id: number;
  version: string;
  release_date: string;
  is_published: number;
  items: ReleaseItem[];
  date_translations: Record<string, string>;
  created_at?: string;
}

export interface PublicRelease {
  id: number;
  version: string;
  release_date: string;
  date_display: string;
  items: { id: number; item_type: string; text: string }[];
}

export const releasesApi = {
  // Public - no auth
  async getPublic(lang: string): Promise<PublicRelease[]> {
    const result = await apiCall<{ success: boolean; data: PublicRelease[] }>(`/releases.php?action=public&lang=${lang}`);
    return result.data || [];
  },

  // Admin - auth required
  async list(): Promise<Release[]> {
    const result = await apiCall<{ success: boolean; data: Release[] }>('/releases.php?action=list');
    return result.data || [];
  },

  async create(data: { version: string; release_date: string; is_published?: number; items?: ReleaseItem[]; date_translations?: Record<string, string> }): Promise<{ id: number }> {
    const result = await apiCall<{ success: boolean; data: { id: number } }>('/releases.php?action=create', {
      method: 'POST', body: JSON.stringify(data),
    });
    return result.data;
  },

  async update(data: Partial<Release> & { id: number }): Promise<void> {
    await apiCall('/releases.php?action=update', { method: 'POST', body: JSON.stringify(data) });
  },

  async delete(id: number): Promise<void> {
    await apiCall('/releases.php?action=delete', { method: 'POST', body: JSON.stringify({ id }) });
  },

  async togglePublish(id: number): Promise<void> {
    await apiCall('/releases.php?action=toggle_publish', { method: 'POST', body: JSON.stringify({ id }) });
  },

  async addItem(data: { release_id: number; item_type: string; sort_order?: number; texts: Record<string, string> }): Promise<{ id: number }> {
    const result = await apiCall<{ success: boolean; data: { id: number } }>('/releases.php?action=add_item', {
      method: 'POST', body: JSON.stringify(data),
    });
    return result.data;
  },

  async updateItem(data: { id: number; item_type?: string; texts?: Record<string, string> }): Promise<void> {
    await apiCall('/releases.php?action=update_item', { method: 'POST', body: JSON.stringify(data) });
  },

  async deleteItem(id: number): Promise<void> {
    await apiCall('/releases.php?action=delete_item', { method: 'POST', body: JSON.stringify({ id }) });
  },
};
