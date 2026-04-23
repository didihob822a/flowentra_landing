// Pages CMS API — talks to /backend/api/pages.php
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://luccibyey.com.tn/flowentra/api';

export interface PageSectionRow {
  id: number;
  page_id?: number;
  section_type: string;
  instance_key: string;
  sort_order: number;
  is_visible: number;
}

export interface CmsPage {
  id: number;
  slug: string;
  title_en: string;
  title_fr: string;
  title_de: string;
  title_ar: string;
  meta_description_en: string;
  meta_description_fr: string;
  meta_description_de: string;
  meta_description_ar: string;
  is_published: number;
  created_at: string;
  updated_at: string;
  sections: PageSectionRow[];
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

async function call<T>(action: string, opts: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}/pages.php?action=${action}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  return res.json();
}

export const pagesApi = {
  list: () => call<CmsPage[]>('list').then(r => r.data || []),
  listPublished: () => call<CmsPage[]>('list_published').then(r => r.data || []),
  getBySlug: (slug: string) =>
    fetch(`${API_BASE}/pages.php?action=get&slug=${encodeURIComponent(slug)}&_=${Date.now()}`, {
      cache: 'no-store',
    })
      .then(r => r.json())
      .then((r: ApiResponse<CmsPage>) => (r.success ? r.data! : null)),
  create: (data: Partial<CmsPage>) => call<{ id: number; slug: string }>('create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: Partial<CmsPage> & { id: number }) => call('update', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: number) => call('delete', { method: 'POST', body: JSON.stringify({ id }) }),
  addSection: (page_id: number, section_type: string) =>
    call<PageSectionRow>('add_section', { method: 'POST', body: JSON.stringify({ page_id, section_type }) }),
  removeSection: (id: number) => call('remove_section', { method: 'POST', body: JSON.stringify({ id }) }),
  reorder: (page_id: number, ordered_ids: number[]) =>
    call('reorder', { method: 'POST', body: JSON.stringify({ page_id, ordered_ids }) }),
  toggleVisible: (id: number, is_visible: boolean) =>
    call('toggle_visible', { method: 'POST', body: JSON.stringify({ id, is_visible: is_visible ? 1 : 0 }) }),
};
