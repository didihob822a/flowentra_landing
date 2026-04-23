// Email API Service — interfaces & fetch calls for the email system

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://luccibyey.com.tn/flowentra/api';

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

// ==================== Types ====================

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  from_name: string;
  from_email: string;
  reply_to: string;
}

export interface EmailTemplate {
  id?: number;
  name: string;
  subject: string;
  html_body: string;
  category: 'general' | 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'notification';
  created_at?: string;
  updated_at?: string;
}

export interface EmailContact {
  id?: number;
  email: string;
  name: string;
  group_name: string;
  is_subscribed?: number;
  created_at?: string;
}

export interface EmailCampaign {
  id?: number;
  subject: string;
  html_body: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

// ==================== API Methods ====================

export const adminEmail = {
  // SMTP
  async getSmtpSettings(): Promise<SmtpSettings | null> {
    const result = await apiCall<{ success: boolean; data: SmtpSettings | null }>('/email.php?action=get_smtp');
    return result.data;
  },

  async saveSmtpSettings(settings: Partial<SmtpSettings>): Promise<void> {
    await apiCall('/email.php?action=save_smtp', { method: 'POST', body: JSON.stringify(settings) });
  },

  async testSmtp(testEmail: string): Promise<{ success: boolean; message?: string }> {
    return apiCall('/email.php?action=test_smtp', { method: 'POST', body: JSON.stringify({ test_email: testEmail }) });
  },

  // Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const result = await apiCall<{ success: boolean; data: EmailTemplate[] }>('/email.php?action=get_templates');
    return result.data || [];
  },

  async saveTemplate(template: Partial<EmailTemplate>): Promise<void> {
    await apiCall('/email.php?action=save_template', { method: 'POST', body: JSON.stringify(template) });
  },

  async deleteTemplate(id: number): Promise<void> {
    await apiCall('/email.php?action=delete_template', { method: 'POST', body: JSON.stringify({ id }) });
  },

  // Contacts
  async getContacts(group?: string): Promise<EmailContact[]> {
    const params = new URLSearchParams({ action: 'get_contacts' });
    if (group) params.append('group', group);
    const result = await apiCall<{ success: boolean; data: EmailContact[] }>(`/email.php?${params}`);
    return result.data || [];
  },

  async saveContact(contact: Partial<EmailContact>): Promise<void> {
    await apiCall('/email.php?action=save_contact', { method: 'POST', body: JSON.stringify(contact) });
  },

  async deleteContact(id: number): Promise<void> {
    await apiCall('/email.php?action=delete_contact', { method: 'POST', body: JSON.stringify({ id }) });
  },

  async importContacts(contacts: { email: string; name?: string }[], groupName?: string): Promise<void> {
    await apiCall('/email.php?action=import_contacts', {
      method: 'POST',
      body: JSON.stringify({ contacts, group_name: groupName }),
    });
  },

  async getGroups(): Promise<{ group_name: string; count: number }[]> {
    const result = await apiCall<{ success: boolean; data: { group_name: string; count: number }[] }>('/email.php?action=get_groups');
    return result.data || [];
  },

  // Sending
  async sendSingle(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; message?: string }> {
    return apiCall('/email.php?action=send_single', {
      method: 'POST',
      body: JSON.stringify({ to, subject, html_body: htmlBody }),
    });
  },

  async sendMass(
    subject: string,
    htmlBody: string,
    group?: string,
    contactIds?: number[],
    delaySeconds = 3
  ): Promise<{ success: boolean; message?: string }> {
    return apiCall('/email.php?action=send_mass', {
      method: 'POST',
      body: JSON.stringify({ subject, html_body: htmlBody, group, contact_ids: contactIds, delay_seconds: delaySeconds }),
    });
  },

  // Campaigns
  async getCampaigns(): Promise<EmailCampaign[]> {
    const result = await apiCall<{ success: boolean; data: EmailCampaign[] }>('/email.php?action=get_campaigns');
    return result.data || [];
  },

  async getSendLog(campaignId?: number): Promise<any[]> {
    const params = new URLSearchParams({ action: 'get_send_log' });
    if (campaignId) params.append('campaign_id', String(campaignId));
    const result = await apiCall<{ success: boolean; data: any[] }>(`/email.php?${params}`);
    return result.data || [];
  },
};