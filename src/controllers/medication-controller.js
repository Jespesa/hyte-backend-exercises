import {
    selectMedicationsByUserId,
    selectMedicationById,
    insertMedication,
    updateMedication,
    deleteMedication,
    selectActiveMedications
  } from '../models/medication-model.js';
  
  /**
   * Get all medications for the logged-in user
   */
  const getMedications = async (req, res, next) => {
    try {
      const medications = await selectMedicationsByUserId(req.user.user_id);
      res.json(medications);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get a medication by ID
   */
  const getMedicationById = async (req, res, next) => {
    try {
      const medication = await selectMedicationById(req.params.id);
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      // Check if the medication belongs to the logged-in user
      if (medication.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only view own medications' });
      }
      
      res.json(medication);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Create a new medication
   */
  const createMedication = async (req, res, next) => {
    try {
      // Prepare the medication data
      const medicationData = {
        user_id: req.user.user_id,
        name: req.body.name,
        dosage: req.body.dosage || null,
        frequency: req.body.frequency || null,
        start_date: req.body.start_date,
        end_date: req.body.end_date || null,
        notes: req.body.notes || null
      };
      
      // Insert the medication
      const medicationId = await insertMedication(medicationData);
      
      res.status(201).json({
        message: 'Medication created successfully',
        medication_id: medicationId
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a medication
   */
  const updateMedicationById = async (req, res, next) => {
    try {
      const medicationId = req.params.id;
      
      // First check if the medication exists and belongs to the user
      const medication = await selectMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      if (medication.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only update own medications' });
      }
      
      // Prepare the medication data for update
      const updatedMedicationData = {
        name: req.body.name,
        dosage: req.body.dosage,
        frequency: req.body.frequency,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        notes: req.body.notes
      };
      
      // Remove undefined fields
      Object.keys(updatedMedicationData).forEach(key => 
        updatedMedicationData[key] === undefined && delete updatedMedicationData[key]
      );
      
      // Update the medication
      await updateMedication(medicationId, updatedMedicationData);
      
      res.json({
        message: 'Medication updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a medication
   */
  const deleteMedicationById = async (req, res, next) => {
    try {
      const medicationId = req.params.id;
      
      // First check if the medication exists and belongs to the user
      const medication = await selectMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      if (medication.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only delete own medications' });
      }
      
      // Delete the medication
      await deleteMedication(medicationId);
      
      res.json({
        message: 'Medication deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get active medications for the logged-in user
   */
  const getActiveMedications = async (req, res, next) => {
    try {
      const medications = await selectActiveMedications(req.user.user_id);
      res.json(medications);
    } catch (error) {
      next(error);
    }
  };
  
  export {
    getMedications,
    getMedicationById,
    createMedication,
    updateMedicationById,
    deleteMedicationById,
    getActiveMedications
  };