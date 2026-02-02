import axios from 'axios';
import {
  McpToolDefinition,
  RecupConsultarPrestamosParams,
  RecupPrestamo,
} from '../../types';

const PILLAR1_BASE_URL = process.env.PILLAR1_BASE_URL || 'http://localhost:3000';

/**
 * Tool Definition for recup_consultar_prestamos
 * Following the exact naming from the domain specification
 */
export const recupConsultarPrestamosTool: McpToolDefinition = {
  name: 'recup_consultar_prestamos',
  description:
    'Consulta los préstamos de la biblioteca filtrados por estado. Opcionalmente puede filtrar por lector específico.',
  inputSchema: {
    type: 'object',
    properties: {
      estado: {
        type: 'string',
        description: 'Estado del préstamo a consultar',
        enum: ['SOLICITADO', 'APROBADO', 'ENTREGADO', 'DEVUELTO', 'VENCIDO'],
      },
      lectorId: {
        type: 'number',
        description: 'ID del lector para filtrar préstamos (opcional)',
      },
    },
    required: ['estado'],
  },
};

/**
 * Execute recup_consultar_prestamos tool
 * Consumes REST API from Pillar 1
 */
export async function executeRecupConsultarPrestamos(
  params: RecupConsultarPrestamosParams
): Promise<RecupPrestamo[]> {
  try {
    const { estado, lectorId } = params;

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('estado', estado);
    if (lectorId !== undefined) {
      queryParams.append('lectorId', lectorId.toString());
    }

    // Call Pillar 1 REST endpoint: GET /recup-prestamos
    const response = await axios.get<RecupPrestamo[]>(
      `${PILLAR1_BASE_URL}/recup-prestamos?${queryParams.toString()}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error al consultar préstamos desde Pilar 1: ${error.message}`
      );
    }
    throw error;
  }
}
