import { apiRequest } from '@/lib/api';
import type {
  DesignProjectPayload,
  SaveDesignProjectPayload,
} from '../types/design-studio.types';

export async function fetchDesignProject(pageVersionId: string) {
  return apiRequest<DesignProjectPayload>(
    `/api/page-versions/${pageVersionId}/design-project`,
  );
}

export async function saveDesignProject(
  pageVersionId: string,
  payload: SaveDesignProjectPayload,
) {
  return apiRequest<DesignProjectPayload>(
    `/api/page-versions/${pageVersionId}/design-project`,
    { method: 'PUT', body: payload },
  );
}

export async function enableGrapesjsStudio(pageVersionId: string) {
  return apiRequest<DesignProjectPayload>(
    `/api/page-versions/${pageVersionId}/design-project/enable-grapesjs`,
    { method: 'POST' },
  );
}
