import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  useToast,
  Text,
  Checkbox,
} from "@chakra-ui/react";
import { Upload, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadGeneExcelFile, getErrors, deleteColumns, fetchColumns } from "api/api-service.js";
import ColumnCategorizer from './ColumnCategorizer';

const ImportView = ({ initialFile }) => {  // Переименовали пропс
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [currentFileName, setCurrentFileName] = useState(initialFile);  // Используем initialFile как начальное значение
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Обновили useEffect, используя initialFile вместо selectedFile
  useEffect(() => {
    if (initialFile) {
      setCurrentFileName(initialFile);
      // Загружаем колонки для существующего файла
      fetchColumns(initialFile)
          .then(data => {
            setColumns(data.columns || []);
          })
          .catch(error => {
            toast({
              title: "Error loading columns",
              description: error.message,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          });
    }
  }, [initialFile, toast]);

  const {
    data: errors,
    isLoading: errorsLoading,
    refetch: refetchErrors,
  } = useQuery({
    queryKey: ["errors"],
    queryFn: getErrors,
    enabled: false,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadGeneExcelFile,
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
        setColumns(data.columns);
        setCurrentFileName(selectedFile.name);  // Сохраняем имя загруженного файла
      }
      setUploadProgress(100);
      queryClient.invalidateQueries(["files"]);
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

  const deleteColumnsMutation = useMutation({
    mutationFn: (columns) => deleteColumns(currentFileName, columns),  // Используем имя текущего файла
    onSuccess: (data) => {
      toast({
        title: "Columns deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Обновляем список колонок после удаления
      setColumns(data.remaining_columns || []);
      setSelectedColumns([]); // Сбрасываем выбранные колонки
    },
    onError: (error) => {
      toast({
        title: "Error deleting columns",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setCurrentFileName(file?.name || null);  // Обновляем имя файла при выборе
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleViewErrors = () => {
    refetchErrors();
    onOpen();
  };

  const handleColumnSelect = (columnName) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnName)) {
        return prev.filter(col => col !== columnName);
      }
      return [...prev, columnName];
    });
  };

  const handleDeleteColumns = () => {
    if (!currentFileName) {
      toast({
        title: "No file selected",
        description: "Please select a file first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedColumns.length === 0) {
      toast({
        title: "No columns selected",
        description: "Please select columns to delete",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    deleteColumnsMutation.mutate(selectedColumns);
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading as="h3" size="md" mb={2}>
          {currentFileName ? `Editing: ${currentFileName}` : 'Upload Gene Excel File'}
        </Heading>
        {!initialFile && (  // Показываем элементы загрузки только если нет initialFile
          <>
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button as="span" leftIcon={<Upload />} colorScheme="blue">
            Select File
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
          </>
        )}
      </Box>

      {(currentFileName || columns.length > 0) && (  // Показываем секцию обновления только если есть файл или колонки
      <Box>
        <Heading as="h3" size="md" mb={4}>
          Update Gene
        </Heading>
        <FormControl>
          <FormLabel>
            Enter the row number to start importing data from:
          </FormLabel>
          <Input placeholder="Enter row number" />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Adjust step value</FormLabel>
          <Input placeholder="Enter step value" />
        </FormControl>
        <HStack justify="space-between" mt={4}>
          <Button colorScheme="blue">Update</Button>
          <Button variant="outline" onClick={handleViewErrors}>
            Errors
          </Button>
        </HStack>
        <Box mt={4}>
          <FormLabel>Progress: {uploadProgress}%</FormLabel>
          <Progress value={uploadProgress} size="sm" colorScheme="blue" />
          {/*<ColumnCategorizer columns={columns} />*/}
        </Box>
        {columns.length > 0 && (  // Показываем колонки только если они загружены
            <Box>
              <Heading as="h4" size="sm" mb={3}>
                Available Columns
              </Heading>
              <VStack align="stretch" spacing={2}>
                {columns.map((column) => (
                    <HStack key={column.name || column}>
                      <Checkbox
                          isChecked={selectedColumns.includes(column.name || column)}
                          onChange={() => handleColumnSelect(column.name || column)}
                      >
                        {column.name || column}
                        {column.category && (
                            <Text as="span" ml={2} color="gray.500">
                              ({column.category})
                            </Text>
                        )}
                      </Checkbox>
                    </HStack>
                ))}
                <Button
                    leftIcon={<Trash2 />}
                    colorScheme="red"
                    onClick={handleDeleteColumns}
                    isLoading={deleteColumnsMutation.isPending}
                    mt={2}
                >
                  Delete Selected Columns
                </Button>
              </VStack>
            </Box>
        )}
      </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Errors</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {errorsLoading ? (
              <Text>Loading errors...</Text>
            ) : errors && errors.length > 0 ? (
              <List spacing={2}>
                {errors.map((error, index) => (
                  <ListItem key={index}>{error}</ListItem>
                ))}
              </List>
            ) : (
              <Text>No errors found.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ImportView;
