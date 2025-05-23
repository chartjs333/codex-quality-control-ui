import axios from "axios";

// const BASE_URL = "http://141.83.25.94:8001/api";
// const BASE_URL = "http://35.232.247.212:8000/api";
const BASE_URL = "http://127.0.0.1:8000/api";

export const filesQuery = () => ({
  queryKey: ["files"],
  queryFn: async () => {
    const response = await axios.get(`${BASE_URL}/gene/list_excel_files`);
    return response.data;
  },
});

export const diseasesGenesQuery = () => ({
  queryKey: ["diseases_genes"],
  queryFn: async () => {
    const response = await axios.get(`${BASE_URL}/gene/list_diseases_genes`);
    return response.data;
  },
});

export const categoriesQuery = () => ({
  queryKey: ["categories"],
  queryFn: async () => {
    const response = await axios.get(`${BASE_URL}/gene/list_categories`);
    return response.data;
  },
});

export const updateSymptomCategory = async (updatedSymptoms) => {
  const response = await axios.post(
    `${BASE_URL}/gene/set_symptom_order`,
    updatedSymptoms
  );
  return response.data;
};

export const symptomsQuery = (geneId) => ({
  queryKey: ["symptoms", geneId],
  queryFn: async () => {
    const response = await axios.get(
      `${BASE_URL}/gene/list_symptoms?json_file=${geneId}`
    );
    return response.data;
  },
});

export const deleteExcelFile = async (fileId) => {
  try {
    await axios.delete(`${BASE_URL}/gene/delete_excel_file?file_id=${fileId}`);
  } catch (error) {
    console.error("Error deleting Excel file:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteSymptom = async (symptomId) => {
  await axios.delete(`${BASE_URL}/gene/delete_symptom?symptomId=${symptomId}`);
};

export const uploadGeneExcelFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${BASE_URL}/gene/add_new_gene`, formData);
};

export const updateExcelFile = async (fileId, newFile) => {
  const formData = new FormData();
  formData.append("file", newFile);
  return await axios.post(
    `${BASE_URL}/gene/update_excel_file?fileId=${fileId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getErrors = async () => {
  const response = await axios.get(`${BASE_URL}/gene/get_errors`);
  return response.data;
};

export const uploadConfiguration = async (zipFile) => {
  const formData = new FormData();
  formData.append("zip", zipFile);
  await axios.post(`${BASE_URL}/gene/upload_configuration`, formData);
};

export const downloadConfiguration = async () => {
  const response = await axios.get(`${BASE_URL}/gene/download_configuration`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "configuration.zip");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const deleteColumns = async (fileName, columnNames) => {
  try {
    const response = await axios.post(`${BASE_URL}/gene/delete_columns`, {
      file_name: fileName,
      columns: columnNames
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting columns:", error.response ? error.response.data : error.message);
    throw error;
  }
};


export const fetchColumns = async (fileName) => {
  try {
    const response = await axios.get(`${BASE_URL}/gene/get_columns?file_name=${fileName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching columns:", error.response ? error.response.data : error.message);
    throw error;
  }
};


export const mergeSymptoms = async (mergeData) => {
  const response = await axios.post(
      `${BASE_URL}/gene/merge_symptoms`,
      mergeData
  );
  return response.data;
};

export const renameSymptom = async (jsonFile, oldName, newName) => {
  console.log("Renaming symptom with data:", {
    jsonFile,
    oldName,
    newName,
  });

  const response = await axios.post(`${BASE_URL}/gene/rename-symptom`, {
    json_file: jsonFile,
    old_name: oldName,
    new_name: newName
  });
  return response.data;
};

// PDF Upload and Analysis endpoints
export const uploadPdfFile = async (file, onProgressUpdate) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${BASE_URL}/ai/gene/upload_pdf`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      // Call the progress update callback if provided
      if (onProgressUpdate) {
        onProgressUpdate(percentCompleted);
      }
      console.log(`Upload Progress: ${percentCompleted}%`);
    },
  });
};

export const uploadPdfForProcessing = async (file, onProgressUpdate) => {
  const formData = new FormData();
  formData.append("file", file); // 'file' should match the parameter name in FastAPI
  return await axios.post(`${BASE_URL}/ai/file/upload_pdf_for_processing`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (onProgressUpdate) {
        onProgressUpdate(percentCompleted);
      }
      console.log(`Upload Progress: ${percentCompleted}%`);
    },
  });
};

export const getPdfAnalysisProgress = async (fileId) => {
  const response = await axios.get(`${BASE_URL}/ai/gene/pdf_analysis_progress?fileId=${fileId}`);
  return response.data;
};

export const getMappingData = async () => {
  const response = await axios.get(`${BASE_URL}/ai/gene/mapping_data`);
  return response.data;
};

export const getFieldStatus = async (field) => {
  const response = await axios.get(`${BASE_URL}/ai/gene/field_status?field=${field}`);
  return response.data;
};

export const getPatientIdentifiers = async (filename) => {
  try {
    const response = await axios.get(`${BASE_URL}/ai/file/patient_identifiers?filename=${filename}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient identifiers:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getPublicationDetails = async (filename) => {
  try {
    const response = await axios.get(`${BASE_URL}/ai/file/publication_details?filename=${filename}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching publication details:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updatePublicationDetails = async (filename, details) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/update_publication_details`, {
      filename,
      details
    });
    return response.data;
  } catch (error) {
    console.error("Error updating publication details:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getPatientAnswers = async (filename) => {
  try {
    const response = await axios.get(`${BASE_URL}/ai/file/process_patient_questions?filename=${filename}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient answers:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updatePatientIdentifier = async (filename, patientId, familyId, data) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/update_patient_identifier`, {
      filename,
      patient_id: patientId,
      family_id: familyId,
      data
    });
    return response.data;
  } catch (error) {
    console.error("Error updating patient identifier:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deletePatientIdentifier = async (filename, patientId, familyId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/ai/file/delete_patient_identifier`, {
      data: {
        filename,
        patient_id: patientId,
        family_id: familyId
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting patient identifier:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const addPatientIdentifier = async (filename, patientData) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/add_patient_identifier`, {
      filename,
      patient_data: patientData
    });
    return response.data;
  } catch (error) {
    console.error("Error adding patient identifier:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Mapping Data API functions
export const getFileMappingData = async () => {
  try {
    // Use the GET endpoint at /api/ai/gene/mapping_data instead of the POST endpoint at /api/ai/file/mapping_data
    const response = await axios.get(`${BASE_URL}/ai/file/mapping_data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mapping data:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateMappingField = async (field, data) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/mapping_data`, {
      action: "update",
      field,
      data
    });
    return response.data;
  } catch (error) {
    console.error("Error updating mapping field:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const addMappingField = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/mapping_data`, {
      action: "add",
      data
    });
    return response.data;
  } catch (error) {
    console.error("Error adding mapping field:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteMappingField = async (field) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/mapping_data`, {
      action: "delete",
      field
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting mapping field:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to export patient data as CSV
export const exportPatientsAsCSV = async (filename) => {
  try {
    // Get publication details and patient data
    const publicationData = await getPublicationDetails(filename);
    const patientIdentifiersData = await getPatientIdentifiers(filename);
    const patientAnswersData = await getPatientAnswers(filename);

    // Process the data to create CSV content
    const processedData = processPatientDataForCSV(
      publicationData, 
      patientIdentifiersData.patient_identifiers, 
      patientAnswersData.patient_answers
    );

    // Create and download the CSV file
    const csvContent = generateCSV(processedData);
    downloadCSV(csvContent, `${filename.replace(/\.[^/.]+$/, '')}_patients.csv`);

    return { success: true };
  } catch (error) {
    console.error("Error exporting patients as CSV:", error);
    throw error;
  }
};

// Helper function to process patient data for CSV format
export const processPatientDataForCSV = (publicationData, patientIdentifiers, patientAnswers) => {
  const result = [];

  // Extract publication details
  const publication = publicationData.publication_details || {};
  const pmid = publicationData.pmid || '';

  patientIdentifiers.forEach(identifier => {
    // Find detailed answers for this patient
    const patientDetails = patientAnswers.find(
      p => (p.individual_id === identifier.patient) &&
           ((p.family_id === identifier.family) ||
            (p.family_id === "-99" && !identifier.family))
    );

    if (patientDetails) {
      const row = {
        // Publication info
        PMID: pmid,
        Author_year: `${publication.first_author_lastname}_${publication.year}`,
        study_design: publication.study_design || '-99',
        genet_methods: publication.genet_methods || '-99',

        // Patient identifiers
        Family_ID: identifier.family || '-99',
        Patient_ID: identifier.patient || '-99',

        // Other patient details (excluding motor and non-motor symptoms)
        ...Object.entries(patientDetails)
          .filter(([key]) => 
            key !== 'motor_symptoms' && 
            key !== 'non_motor_symptoms' && 
            key !== 'individual_id' && 
            key !== 'family_id'
          )
          .reduce((obj, [key, value]) => {
            obj[key] = value || '-99';
            return obj;
          }, {})
      };

      // Process motor symptoms
      if (patientDetails.motor_symptoms) {
        const motorSymptoms = patientDetails.motor_symptoms.split(';')
          .map(symptom => {
            const parts = symptom.trim().split(':').map(s => s.trim());
            return { name: parts[0], value: parts[1] || '-99' };
          });

        motorSymptoms.forEach(symptom => {
          if (symptom.name) {
            row[`${symptom.name.toLowerCase().replace(/\s+/g, '_')}_sympt`] = symptom.value || '-99';
          }
        });
      }

      // Process non-motor symptoms
      if (patientDetails.non_motor_symptoms) {
        const nonMotorSymptoms = patientDetails.non_motor_symptoms.split(';')
          .map(symptom => {
            const parts = symptom.trim().split(':').map(s => s.trim());
            return { name: parts[0], value: parts[1] || '-99' };
          });

        nonMotorSymptoms.forEach(symptom => {
          if (symptom.name) {
            row[`${symptom.name.toLowerCase().replace(/\s+/g, '_')}_sympt`] = symptom.value || '-99';
          }
        });
      }

      result.push(row);
    }
  });

  return result;
};

// Helper function to generate CSV content
const generateCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get all unique headers from all rows
  const headers = Array.from(
    new Set(
      data.flatMap(row => Object.keys(row))
    )
  );

  // Create CSV header row
  let csv = headers.join(',') + '\n';

  // Add data rows
  data.forEach(row => {
    const csvRow = headers.map(header => {
      const value = row[header] !== undefined ? row[header] : '-99';
      // Escape commas and quotes in values
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');

    csv += csvRow + '\n';
  });

  return csv;
};

// Helper function to download CSV file
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to get cached questions for a specific PMID (or all questions if pmid is empty)
export const getCachedQuestions = async (pmid) => {
  try {
    const url = pmid ? `${BASE_URL}/ai/cache/questions?pmid=${pmid}` : `${BASE_URL}/ai/cache/questions`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching cached questions:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// ZIP file handling functions
export const uploadZipFile = (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return axios.post(`${BASE_URL}/ai/file/upload_zip`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100) / e.total))
  });
};

export const getZipAnalysisStatus = taskId =>
  axios.get(`${BASE_URL}/ai/file/zip_analysis_status`, {
    params: { task_id: taskId }
  });

export const downloadZipResults = taskId =>
  axios.get(`${BASE_URL}/ai/file/download_zip_results`, {
    params: { task_id: taskId },
    responseType: "blob"
  }).then(res => {
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "batch_results.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

export const getDocumentsList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/ai/documents`);
    return response.data;
  } catch (error) {
    console.error("Ошибка получения списка документов:", error);
    throw error;
  }
};

// Удаление документа и кэша по выбранному документу и PMID
export const deleteDocumentAndCache = async (pdfFilename, pmid) => {
  const response = await axios.delete(`${BASE_URL}/ai/file/delete_document_and_cache`, {
    params: { pdf_filename: pdfFilename, pmid },
  });
  return response.data;
};

// Function to process patient data to Excel for MDSGene export
export const processToExcel = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/ai/file/process_to_excel`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(
        "Error processing data to Excel:",
        error.response ? error.response.data : error.message
    );
    throw error;
  }
};
