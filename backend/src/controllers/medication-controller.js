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
      console.log('Getting medications for user:', req.user.user_id);
      const medications = await selectMedicationsByUserId(req.user.user_id);
      console.log(`Found ${medications.length} medications`);
      res.json(medications);
    } catch (error) {
      console.error('Error in getMedications:', error);
      next(error);
    }
  };
  
  /**
   * Get a medication by ID
   */
  const getMedicationById = async (req, res, next) => {
    try {
      console.log(`Getting medication with ID: ${req.params.id} for user: ${req.user.user_id}`);
      const medication = await selectMedicationById(req.params.id);
      
      if (!medication) {
        console.log(`Medication with ID ${req.params.id} not found`);
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      // Check if the medication belongs to the logged-in user
      if (medication.user_id !== req.user.user_id) {
        console.log(`Access denied: Medication belongs to user ${medication.user_id}, not ${req.user.user_id}`);
        return res.status(403).json({ message: 'Access denied - can only view own medications' });
      }
      
      console.log('Medication found:', medication.name);
      res.json(medication);
    } catch (error) {
      console.error('Error in getMedicationById:', error);
      next(error);
    }
  };
  
  /**
   * Create a new medication
   */
  const createMedication = async (req, res, next) => {
    try {
      console.log('Creating new medication for user:', req.user.user_id);
      console.log('Request body:', req.body);
      
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
      console.log(`Medication created with ID: ${medicationId}`);
      
      res.status(201).json({
        message: 'Medication created successfully',
        medication_id: medicationId
      });
    } catch (error) {
      console.error('Error in createMedication:', error);
      next(error);
    }
  };
  
  /**
   * Update a medication
   */
  const updateMedicationById = async (req, res, next) => {
    try {
      const medicationId = req.params.id;
      console.log(`Updating medication with ID: ${medicationId} for user: ${req.user.user_id}`);
      console.log('Request body:', req.body);
      
      // First check if the medication exists and belongs to the user
      const medication = await selectMedicationById(medicationId);
      
      if (!medication) {
        console.log(`Medication with ID ${medicationId} not found`);
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      if (medication.user_id !== req.user.user_id) {
        console.log(`Access denied: Medication belongs to user ${medication.user_id}, not ${req.user.user_id}`);
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
      
      console.log('Updated data:', updatedMedicationData);
      
      // Update the medication
      await updateMedication(medicationId, updatedMedicationData);
      console.log(`Medication ${medicationId} updated successfully`);
      
      res.json({
        message: 'Medication updated successfully'
      });
    } catch (error) {
      console.error('Error in updateMedicationById:', error);
      next(error);
    }
  };
  
  /**
   * Delete a medication
   */
  const deleteMedicationById = async (req, res, next) => {
    try {
      const medicationId = req.params.id;
      console.log(`Deleting medication with ID: ${medicationId} for user: ${req.user.user_id}`);
      
      // First check if the medication exists and belongs to the user
      const medication = await selectMedicationById(medicationId);
      
      if (!medication) {
        console.log(`Medication with ID ${medicationId} not found`);
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      if (medication.user_id !== req.user.user_id) {
        console.log(`Access denied: Medication belongs to user ${medication.user_id}, not ${req.user.user_id}`);
        return res.status(403).json({ message: 'Access denied - can only delete own medications' });
      }
      
      // Delete the medication
      await deleteMedication(medicationId);
      console.log(`Medication ${medicationId} deleted successfully`);
      
      res.json({
        message: 'Medication deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteMedicationById:', error);
      next(error);
    }
  };
  
  /**
   * Get active medications for the logged-in user
   */
  const getActiveMedications = async (req, res, next) => {
    try {
      console.log('Getting active medications for user:', req.user.user_id);
      const medications = await selectActiveMedications(req.user.user_id);
      console.log(`Found ${medications.length} active medications`);
      res.json(medications);
    } catch (error) {
      console.error('Error in getActiveMedications:', error);
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