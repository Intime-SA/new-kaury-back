const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CommonSetting {
  _id: string;
  name: string;
  description: string;
  value: number;
  change: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommonSettingResponse {
  settings: CommonSetting[];
}

export interface CreateCommonSettingData {
  name: string;
  description: string;
  value: number;
  change: boolean;
  active: boolean;
}

export interface UpdateCommonSettingData extends Partial<CreateCommonSettingData> {}

class SettingsCommonService {
  private baseUrl: string;

  constructor() {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not defined');
    }
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
  }

  // GET /api/settings/common
  async getAll(): Promise<CommonSettingResponse> {
    const response = await fetch(`${this.baseUrl}/settings/common`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener settings comunes');
    return await response.json();
  }

  // POST /api/settings/common
  async create(data: CreateCommonSettingData): Promise<CommonSetting> {
    const response = await fetch(`${this.baseUrl}/settings/common`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear setting común');
    return await response.json();
  }

  // PUT /settings/common/[id]
  async update(id: string, data: UpdateCommonSettingData): Promise<CommonSetting> {
    const response = await fetch(`${this.baseUrl}/settings/common/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar setting común');
    return await response.json();
  }

  // DELETE /settings/common/[id]
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/settings/common/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al eliminar setting común');
  }
}

export const settingsCommonService = new SettingsCommonService(); 