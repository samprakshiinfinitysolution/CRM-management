import { getToken } from '@/lib/utils';
import type { ExportLeadsPayload } from '@/types/api.types';
import { toast } from 'sonner';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Downloads leads export file (.xlsx or .csv) from the backend API.
 * Automatically handles token authentication, Content-Disposition filename extraction,
 * and browser file download triggering.
 */
export async function downloadLeadsExport(payload: ExportLeadsPayload = {}): Promise<boolean> {
  const toastId = toast.loading('Generating leads export file...');

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/exports/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to export leads';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    }

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `leads_export_${new Date().toISOString().split('T')[0]}.${payload.format || 'xlsx'}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        fileName = match[1].trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);

    toast.success(`Successfully downloaded ${fileName}`, { id: toastId });
    return true;
  } catch (error) {
    console.error('Error exporting leads:', error);
    toast.error('Network error occurred while exporting leads. Please try again.', {
      id: toastId,
    });
    return false;
  }
}
