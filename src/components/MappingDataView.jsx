import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFileMappingData, deleteMappingField } from "api/api-service.js";
import MappingFieldEditModal from "./MappingFieldEditModal";
import MappingFieldAddModal from "./MappingFieldAddModal";

const MappingDataView = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedField, setSelectedField] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const cancelRef = React.useRef();

  // Fetch mapping data
  const { data: mappingData, isLoading, isError, error } = useQuery({
    queryKey: ["mapping_data"],
    queryFn: getFileMappingData,
  });

  // Delete mapping field mutation
  const deleteMutation = useMutation({
    mutationFn: (field) => deleteMappingField(field),
    onSuccess: () => {
      toast({
        title: "Field deleted",
        description: "The mapping field has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries(["mapping_data"]);
      setIsDeleteAlertOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleDelete = (field) => {
    setSelectedField(field);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedField) {
      deleteMutation.mutate(selectedField);
    }
  };

  // Filter mapping data based on search term
  const filteredMappingData = mappingData
    ? mappingData.filter((item) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          item.field.toLowerCase().includes(searchTermLower) ||
          (item.question && item.question.toLowerCase().includes(searchTermLower)) ||
          (item.mapped_excel_column && item.mapped_excel_column.toLowerCase().includes(searchTermLower)) ||
          (item.custom_processor && item.custom_processor.toLowerCase().includes(searchTermLower)) ||
          (item.query_processor && item.query_processor.toLowerCase().includes(searchTermLower))
        );
      })
    : [];

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading mapping data...</Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">Error loading mapping data: {error.message}</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h3" size="md">
            Mapping Data Configuration
          </Heading>
          <MappingFieldAddModal />
        </Flex>
        <Text mb={4}>
          Configure the mapping fields used for AI analysis of PDF documents.
        </Text>

        {/* Search Input */}
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <InputRightElement>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchTerm("")}
              >
                <CloseIcon color="gray.500" boxSize={3} />
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
      </Box>

      {mappingData && mappingData.length > 0 ? (
        <>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Field</Th>
                <Th>Processor Type</Th>
                <Th>Query Processor</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredMappingData.length > 0 ? (
                filteredMappingData.map((item) => (
                  <Tr key={item.field}>
                    <Td>{item.field}</Td>
                    <Td>{item.custom_processor || "default"}</Td>
                    <Td>{item.query_processor || "gemini"}</Td>
                    <Td>
                      <Badge
                        colorScheme={item.active ? "green" : "gray"}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex>
                        <MappingFieldEditModal mappingField={item} />
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          leftIcon={<DeleteIcon />}
                          ml={2}
                          onClick={() => handleDelete(item.field)}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    <Text py={4}>No matching fields found. Try a different search term.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          {searchTerm && (
            <Text mt={2} fontSize="sm" color="gray.500">
              Showing {filteredMappingData.length} of {mappingData.length} fields
            </Text>
          )}
        </>
      ) : (
        <Box textAlign="center" py={10}>
          <Text>No mapping fields found. Click "Add Field" to create one.</Text>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Mapping Field
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this mapping field? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default MappingDataView;
