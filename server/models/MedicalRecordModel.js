import sql from 'mssql'
import { dbConnection } from '../config/connection.js'

export class MedicalRecordModel {
  // Create new medical record
  static async createRecord(pet_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note = null, record_image = null) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('pet_id', sql.Int, pet_id)
      request.input('record_visit_date', sql.DateTime, record_visit_date)
      request.input('record_consultation_type', sql.VarChar, record_consultation_type)
      request.input('record_vet_name', sql.VarChar, record_vet_name)
      request.input('record_vet_clinic_name', sql.VarChar, record_vet_clinic_name)
      request.input('record_pet_weight', sql.Decimal(5, 2), record_pet_weight)
      request.input('record_pet_temperature', sql.Decimal(5, 2), record_pet_temperature)
      request.input('record_note', sql.VarChar(sql.MAX), record_note)
      request.input('record_image', sql.VarChar(sql.MAX), record_image)
  
      const result = await request.query(`
        INSERT INTO MedicalRecord (pet_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note, record_image)
        VALUES (@pet_id, @record_visit_date, @record_consultation_type, @record_vet_name, @record_vet_clinic_name, @record_pet_weight, @record_pet_temperature, @record_note, @record_image)
        SELECT SCOPE_IDENTITY() as record_id
      `)
  
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  // Get record by ID
  static async getRecordById(record_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('record_id', sql.Int, record_id)
  
      const result = await request.query(`
        SELECT record_id, pet_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note, record_image, created_at, updated_at
        FROM MedicalRecord
        WHERE record_id = @record_id AND is_deleted = 0
      `)
  
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  // Get all records by pet ID
  static async getRecordsByPetId(pet_id) {
    const connection = await dbConnection()
    
    try {
      const request = connection.request()
  
      request.input('pet_id', sql.Int, pet_id)
  
      const result = await request.query(`
        SELECT record_id, pet_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note, record_image, created_at, updated_at
        FROM MedicalRecord
        WHERE pet_id = @pet_id AND is_deleted = 0
        ORDER BY record_visit_date DESC
      `)
  
      return result.recordset
    } finally {
      await connection.close()
    }
  }

  // Get all records (active only)
  static async getAllRecords() {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      const result = await request.query(`
        SELECT record_id, pet_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note, record_image, created_at, updated_at
        FROM MedicalRecord
        WHERE is_deleted = 0
        ORDER BY record_visit_date DESC
      `)
  
      return result.recordset
    } finally {
      await connection.close()
    }
  }

  // Update record
  static async updateRecord(record_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note, record_image) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('record_id', sql.Int, record_id)
      request.input('record_visit_date', sql.DateTime, record_visit_date)
      request.input('record_consultation_type', sql.VarChar, record_consultation_type)
      request.input('record_vet_name', sql.VarChar, record_vet_name)
      request.input('record_vet_clinic_name', sql.VarChar, record_vet_clinic_name)
      request.input('record_pet_weight', sql.Decimal(5, 2), record_pet_weight)
      request.input('record_pet_temperature', sql.Decimal(5, 2), record_pet_temperature)
      request.input('record_note', sql.VarChar(sql.MAX), record_note)
      request.input('record_image', sql.VarChar(sql.MAX), record_image)
  
      await request.query(`
        UPDATE MedicalRecord
        SET record_visit_date = @record_visit_date, record_consultation_type = @record_consultation_type, record_vet_name = @record_vet_name, record_vet_clinic_name = @record_vet_clinic_name, record_pet_weight = @record_pet_weight, record_pet_temperature = @record_pet_temperature, record_note = @record_note, record_image = @record_image, updated_at = GETDATE()
        WHERE record_id = @record_id AND is_deleted = 0
      `)
  
      return { success: true, record_id }
    } finally {
      await connection.close()
    }
  }

  // Soft delete record
  static async deleteRecord(record_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('record_id', sql.Int, record_id)
  
      await request.query(`
        UPDATE MedicalRecord
        SET is_deleted = 1, updated_at = GETDATE()
        WHERE record_id = @record_id
      `)
  
      return { success: true, record_id }
    } finally {
      await connection.close()
    }
  }

  // Check if pet exists
  static async petExists(pet_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('pet_id', sql.Int, pet_id)
  
      const result = await request.query(`
        SELECT pet_id FROM Pet WHERE pet_id = @pet_id
      `)
  
      return result.recordset.length > 0
    } finally {
      await connection.close()
    }
  }
}
