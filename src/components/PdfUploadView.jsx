import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Progress,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Divider,
  List,
  ListItem,
  Link,
  Badge,
  Flex,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
} from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  uploadPdfFile,
  uploadPdfForProcessing,
  getPdfAnalysisProgress,
  getMappingData,
  getPatientIdentifiers,
  getPatientAnswers,
  getPublicationDetails,
  updatePublicationDetails, // Добавляем импорт этой функции, если нужно
  exportPatientsAsCSV,
  uploadZipFile,
  getZipAnalysisStatus,
  downloadZipResults,
  processToExcel,
  processPatientDataForCSV
} from "api/api-service.js";
import PublicationEditModal from "./PublicationEditModal";
import PatientIdentifierEditModal from "./PatientIdentifierEditModal";
import PatientIdentifierAddModal from "./PatientIdentifierAddModal";

const PdfUploadView = () => {
  // Single PDF state variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publicationDetails, setPublicationDetails] = useState(null);
  const [patientIdentifiers, setPatientIdentifiers] = useState(null);
  const [patientAnswers, setPatientAnswers] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [mappingData, setMappingData] = useState(null);
  // fieldStatuses state removed as it's no longer needed
  const toast = useToast();
  const queryClient = useQueryClient();
  const [expandedPatients, setExpandedPatients] = useState({});
  const [filename, setFileName] = useState("");

  // Batch ZIP state variables
  const [selectedZip, setSelectedZip] = useState(null);
  const [zipUploadProgress, setZipUploadProgress] = useState(0);
  const [analysisZipProgress, setAnalysisZipProgress] = useState(0);
  const [uploadingZip, setUploadingZip] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [downloadReady, setDownloadReady] = useState(false);

// Function to toggle expanded state
  const togglePatientDetails = (patientId) => {
    setExpandedPatients(prev => ({
      ...prev,
      [patientId]: !prev[patientId]
    }));
  };


  // Fetch mapping data
  const mappingDataQuery = useQuery({
    queryKey: ["mapping_data"],
    queryFn: getMappingData,
    enabled: false, // Don't fetch on component mount
    onSuccess: (data) => {
      setMappingData(data);
      // No need to fetch status for each field as AIProcessorService works synchronously
    },
    onError: (error) => {
      toast({
        title: "Error fetching mapping data",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadPdfForProcessing(file, setUploadProgress),
    onSuccess: ({ data }) => {
      if (data.message?.includes("ERROR")) {
        toast({
          title: "Error uploading file",
          description: data,
          status: "error",
          isClosable: true,
        });
      } else {
        toast({
          title: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setUploadProgress(100);

        // Fetch mapping data
        mappingDataQuery.refetch();

      // Get the filename from the response
        const serverFilename = data.filename;
        // Сохраняем имя файла в state
        setFileName(serverFilename);

      // Declare variables to store data across promise chain
      let accumulatedPublicationData = null;
      let accumulatedPatientIdentifiers = null;
      let patientAnswersData = null;

      // Step 1: Fetch publication details
      getPublicationDetails(serverFilename)
        .then((publicationData) => {
          accumulatedPublicationData = publicationData; // Store for later use
          setPublicationDetails(publicationData);

          toast({
            title: "Publication details retrieved",
            description: publicationData.publication_details.title,
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          // Step 2: Fetch basic patient identifiers
          return getPatientIdentifiers(serverFilename);
        })
        .then((patientData) => {
          accumulatedPatientIdentifiers = patientData.patient_identifiers; // Store for later use
          setPatientIdentifiers(patientData.patient_identifiers);

          toast({
            title: "Patient information retrieved",
            description: `Found ${patientData.patient_identifiers.length} patients in file`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          // Step 3: Finally, fetch detailed patient answers
          return getPatientAnswers(serverFilename);
        })
        .then((answersData) => {
          patientAnswersData = answersData; // Store for later use
          setPatientAnswers(answersData); // Use the parameter, not the variable
          toast.closeAll();
          toast({
            title: "Patient answers processed",
            description: `Details for ${answersData.patient_answers.length} patients retrieved`,
            status: "success",
            duration: 2000,
            isClosable: true,
          });

          // Now we have all three parts of data:
          // 1. accumulatedPublicationData
          // 2. accumulatedPatientIdentifiers
          // 3. patientAnswersData.patient_answers

          if (
              accumulatedPublicationData &&
              accumulatedPatientIdentifiers &&
              patientAnswersData && patientAnswersData.patient_answers
          ) {
            // Send data to Excel processing endpoint
            // Создаем toast и сохраняем его ID
            const toastId = toast({
              title: "Sending data for MDSGene processing...",
              status: "info",
              duration: null
            });
            return processToExcel(processPatientDataForCSV(accumulatedPublicationData, accumulatedPatientIdentifiers, patientAnswersData.patient_answers))
                .then(response => {
                  // Закрываем toast с уведомлением
                  toast.close(toastId);

                  // Показываем успешное уведомление
                  toast({
                    title: "MDSGene AI processing completed",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                  });

                  return response;
                })
                .catch(error => {
                  // Закрываем toast с уведомлением даже в случае ошибки
                  toast.close(toastId);

                  // Показываем уведомление об ошибке
                  toast({
                    title: "MDSGene AI processing failed",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true
                  });

                  throw error;
                });
          } else {
            console.error("One or more data components are missing:", {
              pubData: !!accumulatedPublicationData,
              patIdents: !!accumulatedPatientIdentifiers,
              patAns: !!(patientAnswersData && patientAnswersData.patient_answers)
            });
            throw new Error("Missing critical data components needed for Excel preparation.");
          }
        })
        .then((response) => {
          // Проверяем, есть ли в ответе gene_urls
          if (response.gene_urls && Object.keys(response.gene_urls).length > 0) {
            // Создаем React-компонент для отображения ссылок
            const GeneLinks = () => (
                <Box mt={2}>
                  <Text fontWeight="bold" mb={1}>Available links:</Text>
                  <VStack align="start" spacing={1}>
                    {Object.entries(response.gene_urls).map(([name, url]) => (
                        <Link key={name} href={url} isExternal color="blue.500" textDecoration="underline">
                          {name}
                        </Link>
                    ))}
                  </VStack>
                </Box>
            );

            // Показываем toast с компонентом ссылок
            toast({
              title: "Data exported to MDSGene",
              description: (
                  <>
                    {response.message || "Data successfully processed to Excel format"}
                    <GeneLinks />
                  </>
              ),
              status: "success",
              duration: 5000, // Увеличиваем время, чтобы пользователь успел увидеть ссылки
              isClosable: true,
            });
          } else {
            // Если нет ссылок, показываем обычное уведомление
            toast({
              title: "Data exported to MDSGene",
              description: response.message || "Data successfully processed to Excel format",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((error) => {
          toast({
            title: "Error fetching document details",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });

        // Since AIProcessorService works synchronously, we don't need to track progress
        setAnalysisStatus("Analysis completed");
        setAnalysisProgress(100);
        toast({
          title: "Analysis completed",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries(["pdf_files"]);
    },
    onError: (error) => {
      toast({
        title: "Error uploading file",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setUploadProgress(0);
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      setUploadProgress(0);
      setAnalysisProgress(0);
      setAnalysisStatus("Uploading...");
      uploadMutation.mutate(selectedFile);
    }
  };

  // ZIP file handling functions
  const handleZipUpload = () => {
    setUploadingZip(true);
    uploadZipFile(selectedZip, setZipUploadProgress)
      .then(res => {
        setTaskId(res.data.task_id);
        pollStatus(res.data.task_id);
      })
      .catch(err => {
        toast({
          title: "Error uploading ZIP file",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => setUploadingZip(false));
  };

  // Poll for ZIP analysis status
  const pollStatus = id => {
    const interval = setInterval(() => {
      getZipAnalysisStatus(id)
        .then(res => {
          setAnalysisZipProgress(res.data.progress);
          if (res.data.status === "done") {
            clearInterval(interval);
            setDownloadReady(true);
            toast({
              title: "Analysis complete",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else if (res.data.status === "error") {
            clearInterval(interval);
            toast({
              title: "Error during analysis",
              description: "An error occurred during the ZIP file analysis",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch(() => {
          clearInterval(interval);
          toast({
            title: "Status check failed",
            description: "Failed to check the analysis status",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }, 3000);
  };

  // Download ZIP analysis results
  const handleDownloadResults = () => {
    downloadZipResults(taskId)
      .then(() => {
        toast({
          title: "Download started",
          description: "Your results are being downloaded",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(err => {
        toast({
          title: "Download failed",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // trackAnalysisProgress function removed as it's no longer needed
  // AIProcessorService works synchronously, so we don't need to track progress
  const PatientDetailComponent = ({ patientAnswers, patientIdentifiers, filename }) => {
    const [publicationDetails, setPublicationDetails] = useState(null);
    const toast = useToast();
// Затем в коде:
    useEffect(() => {
      const filename = selectedFile?.name;

      if (filename) {
        getPublicationDetails(filename)
            .then(details => {
              setPublicationDetails(details);
            })
            .catch(error => {
              toast({
                title: "Error",
                description: "Failed to load publication details",
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            });
      }
    }, [filename, toast]);
  }
  // Helper function to format symptoms
  const formatSymptoms = (symptomsData) => {
    if (!symptomsData || symptomsData === "None") {
      return <Text>None reported</Text>;
    }

    // Split by semicolons or newlines
    const symptoms = symptomsData.split(/[;\n]+/).filter(s => s.trim());

    return (
      <List spacing={1}>
        {symptoms.map((symptom, index) => {
          const parts = symptom.split(':').map(s => s.trim());
          const name = parts[0] || '';
          const status = parts[1] || '';
          const isPresent = status && status.toLowerCase() === 'yes';

          return (
            <ListItem key={index} display="flex" alignItems="center">
              <Badge 
                colorScheme={isPresent ? "green" : "red"} 
                mr={2}
              >
                {isPresent ? "YES" : "NO"}
              </Badge>
              <Text>{name}</Text>
            </ListItem>
          );
        })}
      </List>
    );
  };

    return (
    <Tabs isFitted variant="enclosed">
      <TabList mb={4}>
        <Tab>Single PDF</Tab>
        <Tab>Batch ZIP</Tab>
      </TabList>
      <TabPanels>
        {/* Tab 1: Single PDF */}
        <TabPanel>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading as="h3" size="md" mb={2}>
                Upload PDF File for MDSGene AI Analysis
              </Heading>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload">
                <Button as="span" leftIcon={<Upload />} colorScheme="blue">
                  Select PDF
                </Button>
              </label>
              {selectedFile && <Text mt={2}>{selectedFile.name}</Text>}
              <Button
                ml={2}
                colorScheme="green"
                onClick={handleUpload}
                isLoading={uploadMutation.isPending}
                isDisabled={!selectedFile}
              >
                Upload
              </Button>
            </Box>

            {/* Publication Details Header with Edit Button */}
            {publicationDetails && publicationDetails.publication_details && (
                <Box mb={4} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Heading size="md">{publicationDetails.publication_details.title}</Heading>
                      <Text>
                        Author: {publicationDetails.publication_details.first_author_lastname},
                        Year: {publicationDetails.publication_details.year}
                        {publicationDetails.pmid && (
                          <>, PMID: <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${publicationDetails.pmid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'blue', textDecoration: 'underline' }}
                          >
                            {publicationDetails.pmid}
                          </a></>
                        )}
                      </Text>
                    </VStack>
                    <PublicationEditModal
                        filename={filename}
                        publicationDetails={publicationDetails}
                        onUpdateSuccess={() => {
                          // Обновить данные публикации после успешного редактирования
                          getPublicationDetails(filename)
                              .then((data) => setPublicationDetails(data))
                              .catch((error) => console.error("Error refreshing publication details:", error));
                        }}
                    />
                  </Flex>
                </Box>
            )}


            {/* Integrated Patient Section with Detailed Information */}
            {patientIdentifiers && (
              <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" bg="white">
                <Flex justify="space-between" align="center" mb={3}>
                  <Heading size="md">Patients in Document</Heading>
                  <Flex>
                    <Button 
                      colorScheme="green" 
                      size="sm" 
                      mr={2}
                      leftIcon={<span role="img" aria-label="download">📊</span>}
                      onClick={() => {
                        if (filename) {
                          try {
                            exportPatientsAsCSV(filename);
                            toast({
                              title: "CSV Export Started",
                              description: "Your patient data is being prepared for download.",
                              status: "info",
                              duration: 3000,
                              isClosable: true,
                            });
                          } catch (error) {
                            toast({
                              title: "Export Failed",
                              description: error.message || "Failed to export patient data as CSV",
                              status: "error",
                              duration: 5000,
                              isClosable: true,
                            });
                          }
                        } else {
                          toast({
                            title: "No File Selected",
                            description: "Please upload a file first",
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      Export as CSV
                    </Button>
                    <PatientIdentifierAddModal
                      filename={filename}
                      onAddSuccess={() => {
                        // Refresh patient identifiers after successful add
                        getPatientIdentifiers(filename)
                          .then((data) => setPatientIdentifiers(data.patient_identifiers))
                          .catch((error) => console.error("Error refreshing patient identifiers:", error));
                      }}
                    />
                  </Flex>
                </Flex>
                {patientIdentifiers.length === 0 ? (
                  <Text color="gray.500" fontStyle="italic" mt={2}>No patients found in this document. Click "Add Patient" to add one.</Text>
                ) : (
                  <Accordion allowMultiple>
                    {patientIdentifiers.map((patient, index) => {
                      // Find detailed answers for this patient if available
                      const patientDetails = patientAnswers?.patient_answers?.find(
                        p => (p.individual_id === patient.patient) &&
                            ((p.family_id === patient.family) ||
                              (p.family_id === "-99" && !patient.family))
                      );

                      return (
                      <AccordionItem key={index}>
                        <h2>
                          <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold">
                                  {patient.family ? `Family ${patient.family} - Patient ${patient.patient}` : `Patient ${patient.patient}`}
                                </Text>
                            </Box>
                              <Badge colorScheme="blue" mr={2}>
                                {patient.family ? `Family ${patient.family}` : 'No Family'}
                              </Badge>
                              <PatientIdentifierEditModal
                                filename={filename}
                                patient={patient}
                                onUpdateSuccess={() => {
                                  // Refresh patient identifiers after successful update
                                  getPatientIdentifiers(filename)
                                    .then((data) => setPatientIdentifiers(data.patient_identifiers))
                                    .catch((error) => console.error("Error refreshing patient identifiers:", error));
                                }}
                              />
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            {patientDetails ? (
                          <VStack align="start" spacing={4} width="100%">
                            {/* Display motor_symptoms with the existing format */}
                            <Box width="100%">
                              <Heading size="sm" mb={2} color="blue.600">Motor Symptoms</Heading>
                              <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                                    {(patientDetails.motor_symptoms || '').split(';').map((symptom, idx) => (
                                  <Text key={idx} mb={1}>
                                    {symptom.trim()}
                                  </Text>
                                ))}
                              </Box>
                            </Box>

                            {/* Display non_motor_symptoms with the existing format */}
                            <Box width="100%">
                              <Heading size="sm" mb={2} color="green.600">Non-Motor Symptoms</Heading>
                              <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                                    {(patientDetails.non_motor_symptoms || '').split(';').map((symptom, idx) => (
                                  <Text key={idx} mb={1}>
                                    {symptom.trim()}
                                  </Text>
                                ))}
                              </Box>
                            </Box>

                            {/* Display all other fields in patientDetails */}
                            {Object.entries(patientDetails).filter(([key]) => 
                              key !== 'motor_symptoms' && key !== 'non_motor_symptoms' && 
                              key !== 'individual_id' && key !== 'family_id'
                            ).map(([key, value]) => (
                              <Box key={key} width="100%">
                                <Heading size="sm" mb={2} color="purple.600">
                                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </Heading>
                                <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                                  {value === null || value === undefined ? (
                                    <Text color="gray.500" fontStyle="italic">No data available</Text>
                                  ) : typeof value === 'string' && value.includes(';') ? (
                                    value.split(';').map((item, idx) => (
                                      <Text key={idx} mb={1}>
                                        {item.trim()}
                                      </Text>
                                    ))
                                  ) : (
                                    <Text>{value}</Text>
                                  )}
                                </Box>
                              </Box>
                            ))}
                          </VStack>
                            ) : (
                              <Text color="gray.500" fontStyle="italic">Retrieving patient information...</Text>
                            )}
                        </AccordionPanel>
                      </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </Box>
            )}


            {/* Display analysis results */}
            {mappingData && (
              <Box mt={4}>
                <Heading as="h3" size="md" mb={4}>
                  Analysis Results
                </Heading>

                {/* Display all fields and their statuses */}
                {mappingData.map((item, index) => (
                  <Box key={item.field} mb={4}>
                    <Heading as="h4" size="sm" mb={2}>
                      {item.field}
                    </Heading>

                    {/* Display field response if available */}
                    {item.response && (
                      <Box>
                        {item.field === "motor_symptoms" || item.field === "non_motor_symptoms" 
                          ? formatSymptoms(item.response)
                          : <Text>{item.response}</Text>
                        }
                      </Box>
                    )}

                    {index < mappingData.length - 1 && <Divider my={4} />}
                  </Box>
                ))}
              </Box>
            )}
          </VStack>
        </TabPanel>

        {/* Tab 2: Batch ZIP Analysis */}
        <TabPanel>
          <VStack align="start" spacing={4}>
            <Heading size="md">Batch ZIP Analysis</Heading>
            <Input
              type="file"
              accept=".zip"
              onChange={e => {
                setSelectedZip(e.target.files[0]);
                setDownloadReady(false);
                setTaskId(null);
                setAnalysisZipProgress(0);
              }}
            />
            <Button
              colorScheme="green"
              isDisabled={!selectedZip || uploadingZip}
              onClick={handleZipUpload}
            >
              Upload ZIP
            </Button>

            {uploadingZip && (
              <Progress value={zipUploadProgress} size="sm" width="100%" />
            )}

            {taskId && (
              <Progress value={analysisZipProgress} size="sm" width="100%" />
            )}

            {downloadReady && (
              <Button colorScheme="blue" onClick={handleDownloadResults}>
                Download Results
              </Button>
            )}
          </VStack>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default PdfUploadView;
