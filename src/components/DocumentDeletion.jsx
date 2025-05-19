import React, { useEffect, useState } from 'react';
import {
  Box, Button, Select, Spinner, Text, useToast, VStack, Heading
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentsList, deleteDocumentAndCache } from 'api/api-service';

const DocumentDeletion = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedDoc, setSelectedDoc] = useState("");

  // Загрузка списка документов
  const { data: documents, isLoading, isError, error } = useQuery({
    queryKey: ['documents_list'],
    queryFn: getDocumentsList,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ filename, pmid }) => deleteDocumentAndCache(filename, pmid),
    onSuccess: () => {
      toast({
        title: "Document and cache successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries(['documents_list']);
      setSelectedDoc("");
    },
    onError: (error) => {
      toast({
        title: "Error deleting document and cache",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleDelete = () => {
    if (!selectedDoc) {
      toast({
        title: "Document not selected",
        description: "Please select the document to be deleted",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const doc = documents.find(d => d.filename === selectedDoc);
    deleteMutation.mutate({ filename: doc.filename, pmid: doc.pmid });
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>Deleting a document and related data</Heading>

      {isLoading && <Spinner />}
      {isError && <Text color="red.500">Document upload error: {error.message}</Text>}

      {!isLoading && !isError && (
        <VStack spacing={4} align="start">
          <Select
            placeholder="Select the document to be deleted"
            value={selectedDoc}
            onChange={e => setSelectedDoc(e.target.value)}
          >
            {documents.map(doc => (
              <option key={doc.filename} value={doc.filename}>
                {doc.title} ({doc.filename})
              </option>
            ))}
          </Select>

          <Button
            colorScheme="red"
            onClick={handleDelete}
            isLoading={deleteMutation.isLoading}
          >
            Delete document and cache
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default DocumentDeletion;