import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  VStack,
  Flex,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Download, Edit } from "lucide-react";
import {
  filesQuery,
  deleteExcelFile,
  downloadConfiguration,
  uploadConfiguration,
  updateExcelFile,
} from "api/api-service.js";

const EditView = ({ onEditFile }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery(filesQuery());

  const deleteFileMutation = useMutation({
    mutationFn: deleteExcelFile,
    onSuccess: () => {
      queryClient.invalidateQueries("files");
      toast({
        title: "File deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting file",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, newFile }) => updateExcelFile(fileId, newFile),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries("files");
      if (data.includes("ERROR")) {
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
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating file",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleDeleteFile = (fileId) => {
    deleteFileMutation.mutate(fileId);
  };

  const handleUpdateFile = (fileId, event) => {
    const newFile = event.target.files[0];
    if (newFile) {
      updateFileMutation.mutate({ fileId, newFile });
    }
  };

  const handleEditFile = (fileId) => {
    onEditFile(fileId);
  };

  const handleDownloadConfiguration = async () => {
    try {
      await downloadConfiguration();
    } catch (error) {
      toast({
        title: "Error downloading configuration",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const uploadConfigurationMutation = useMutation({
    mutationFn: uploadConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries("files");
      toast({
        title: "Configuration uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error uploading configuration",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleUploadConfiguration = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadConfigurationMutation.mutate(file);
    }
  };

  return (
    <Flex gap={6} alignItems="flex-start">
      <Box width="60%" overflowX="auto">
        {filesLoading ? (
          <Spinner />
        ) : filesError ? (
          <Text color="red.500">Error loading files: {filesError.message}</Text>
        ) : (
          <Table
            variant="simple"
            bg="white"
            borderRadius="md"
            overflow="hidden"
            size="sm"
          >
            <Thead bg="gray.100">
              <Tr>
                <Th>Gene Excel File</Th>
                <Th w="160px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {files.map((file) => (
                <Tr key={file}>
                  <Td>{file}</Td>
                  <Td w="160px">
                    <IconButton
                        aria-label="Edit file"
                        icon={<Edit />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        mr={2}
                        onClick={() => handleEditFile(file)}
                    />
                    <IconButton
                      aria-label="Update file"
                      icon={<Upload />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      mr={2}
                      isLoading={updateFileMutation.isLoading}
                      onClick={() =>
                        document.getElementById(`file-input-${file}`).click()
                      }
                    />
                    <input
                      id={`file-input-${file}`}
                      type="file"
                      hidden
                      accept=".xls,.xlsx"
                      onChange={(e) => handleUpdateFile(file, e)}
                    />
                    <IconButton
                      aria-label="Delete file"
                      icon={<Trash2 />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteFile(file)}
                      isLoading={deleteFileMutation.isLoading}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
      <VStack width="40%" spacing={4} align="stretch">
        <Button
          leftIcon={<Download />}
          colorScheme="teal"
          size="md"
          onClick={handleDownloadConfiguration}
        >
          Download Configuration
        </Button>
        <Button leftIcon={<Upload />} colorScheme="purple" size="md" as="label">
          Upload Configuration
          <input
            type="file"
            hidden
            accept=".zip"
            onChange={handleUploadConfiguration}
          />
        </Button>
      </VStack>
    </Flex>
  );
};



export default EditView;
