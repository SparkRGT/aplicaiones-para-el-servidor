import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Servicio de Base de Datos SQLite (usando sql.js)
 * Maneja la tabla Exam2PRegistroAuditoria
 */
export class DatabaseService {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || process.env.DB_PATH || './data/auditoria.db';
    
    // Crear directorio si no existe
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Guardar base de datos a disco
   */
  private saveToFile(): void {
    if (this.db) {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    }
  }

  /**
   * Inicializar base de datos (crear tabla si no existe)
   */
  async initialize(): Promise<void> {
    try {
      const SQL = await initSqlJs();
      
      // Cargar base de datos existente o crear nueva
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
      } else {
        this.db = new SQL.Database();
      }

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS Exam2PRegistroAuditoria (
          registroId TEXT PRIMARY KEY,
          exam2p_entidad TEXT NOT NULL,
          exam2p_registroAfectadoId INTEGER NOT NULL,
          exam2p_accion TEXT NOT NULL CHECK (exam2p_accion IN ('CREAR', 'MODIFICAR', 'ELIMINAR')),
          exam2p_fechaHora TEXT NOT NULL,
          exam2p_detalle TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableSQL);

      // Crear índices
      const indices = [
        'CREATE INDEX IF NOT EXISTS idx_entidad ON Exam2PRegistroAuditoria(exam2p_entidad)',
        'CREATE INDEX IF NOT EXISTS idx_accion ON Exam2PRegistroAuditoria(exam2p_accion)',
        'CREATE INDEX IF NOT EXISTS idx_fecha ON Exam2PRegistroAuditoria(exam2p_fechaHora DESC)',
        'CREATE INDEX IF NOT EXISTS idx_registro_afectado ON Exam2PRegistroAuditoria(exam2p_registroAfectadoId)'
      ];

      indices.forEach(idx => this.db!.run(idx));
      
      this.saveToFile();
      console.log('✓ Tabla Exam2PRegistroAuditoria verificada/creada (SQLite)');
    } catch (error) {
      console.error('❌ Error inicializando SQLite:', error);
      throw error;
    }
  }

  /**
   * Insertar nuevo registro de auditoría
   */
  async insertAuditoria(auditoria: {
    registroId: string;
    exam2p_entidad: string;
    exam2p_registroAfectadoId: number;
    exam2p_accion: string;
    exam2p_fechaHora: string;
    exam2p_detalle?: string;
  }): Promise<boolean> {
    try {
      const sql = `
        INSERT INTO Exam2PRegistroAuditoria 
        (registroId, exam2p_entidad, exam2p_registroAfectadoId, exam2p_accion, exam2p_fechaHora, exam2p_detalle)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db!.run(sql, [
        auditoria.registroId,
        auditoria.exam2p_entidad,
        auditoria.exam2p_registroAfectadoId,
        auditoria.exam2p_accion,
        auditoria.exam2p_fechaHora,
        auditoria.exam2p_detalle || null
      ]);

      this.saveToFile();
      console.log(`✓ Auditoría insertada: ${auditoria.registroId}`);
      return true;
    } catch (error) {
      console.error('❌ Error insertando auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtener auditoría por ID
   */
  async getAuditoriaById(registroId: string): Promise<any | null> {
    const stmt = this.db!.prepare('SELECT * FROM Exam2PRegistroAuditoria WHERE registroId = ?');
    stmt.bind([registroId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    
    stmt.free();
    return null;
  }

  /**
   * Obtener todas las auditorías
   */
  async getAllAuditorias(): Promise<any[]> {
    const results: any[] = [];
    const stmt = this.db!.prepare('SELECT * FROM Exam2PRegistroAuditoria ORDER BY exam2p_fechaHora DESC');
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    return results;
  }

  /**
   * Obtener auditorías por acción
   */
  async getAuditorisByAccion(accion: string): Promise<any[]> {
    const results: any[] = [];
    const stmt = this.db!.prepare('SELECT * FROM Exam2PRegistroAuditoria WHERE exam2p_accion = ? ORDER BY exam2p_fechaHora DESC');
    stmt.bind([accion]);
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    return results;
  }

  /**
   * Obtener auditorías por entidad
   */
  async getAuditorisByEntidad(entidad: string): Promise<any[]> {
    const results: any[] = [];
    const stmt = this.db!.prepare('SELECT * FROM Exam2PRegistroAuditoria WHERE exam2p_entidad = ? ORDER BY exam2p_fechaHora DESC');
    stmt.bind([entidad]);
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    return results;
  }

  /**
   * Eliminar auditoría
   */
  async deleteAuditoria(registroId: string): Promise<boolean> {
    this.db!.run('DELETE FROM Exam2PRegistroAuditoria WHERE registroId = ?', [registroId]);
    const changes = this.db!.getRowsModified();
    this.saveToFile();
    return changes > 0;
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(): Promise<any> {
    const results: any[] = [];
    const stmt = this.db!.prepare(`
      SELECT 
        exam2p_accion as accion,
        COUNT(*) as cantidad
      FROM Exam2PRegistroAuditoria
      GROUP BY exam2p_accion
    `);
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();

    const stats: any = {
      total: 0,
      porAccion: {}
    };

    results.forEach((row: any) => {
      stats.porAccion[row.accion] = row.cantidad;
      stats.total += row.cantidad;
    });

    return stats;
  }

  /**
   * Cerrar conexión
   */
  async close(): Promise<void> {
    if (this.db) {
      this.saveToFile();
      this.db.close();
    }
  }
}
