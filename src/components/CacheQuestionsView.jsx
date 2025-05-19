import React, { useState, useMemo } from "react";
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
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { getCachedQuestions } from "api/api-service.js";

const CacheQuestionsView = () => {
  const toast = useToast();
  const [pmid, setPmid] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);

  // Fetch cached questions
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cached_questions", pmid],
    queryFn: () => getCachedQuestions(pmid),
    enabled: false, // Don't fetch on component mount, only when search is clicked
  });

  const handleSearch = () => {
    setSearchClicked(true);
    refetch();
  };

  const handleClear = () => {
    setPmid("");
    setSearchClicked(false);
  };

  // Extract questions array from the response
  const questionsArray = data?.questions || [];
  const totalCount = data?.count || 0;

  // Filter questions based on search term
  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questionsArray;

    const term = searchTerm.toLowerCase().trim();
    return questionsArray.filter(item =>
      item.question.toLowerCase().includes(term) ||
      item.raw_answer.toLowerCase().includes(term)
    );
  }, [questionsArray, searchTerm]);

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading as="h3" size="md" mb={4}>
          Cached Questions
        </Heading>
        <Text mb={4}>
          Retrieve cached questions for a specific PMID. Leave PMID empty to retrieve all cached questions.
        </Text>

        {/* PMID Input */}
        <FormControl mb={4}>
          <FormLabel>PMID</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Enter PMID..."
              value={pmid}
              onChange={(e) => setPmid(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            {pmid && (
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                >
                  <CloseIcon color="gray.500" boxSize={3} />
                </Button>
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleSearch}
          isLoading={isLoading}
          mb={4}
        >
          Search
        </Button>
      </Box>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading cached questions...</Text>
        </Box>
      ) : isError ? (
        <Box textAlign="center" py={10}>
          <Text color="red.500">Error loading cached questions: {error.message}</Text>
        </Box>
      ) : searchClicked && data ? (
        questionsArray.length > 0 ? (
          <>
            <HStack justify="space-between" mb={2}>
              <Text>Found {totalCount} cached questions{pmid ? ` for PMID: ${pmid}` : ""}</Text>

              {/* Text search input */}
              <InputGroup maxWidth="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search in questions and answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="md"
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
            </HStack>

            {filteredQuestions.length > 0 ? (
              <>
                {searchTerm && (
                  <Text mb={2}>Found {filteredQuestions.length} results for "{searchTerm}"</Text>
                )}
          <Table variant="simple">
            <Thead>
              <Tr>
                  <Th>PMID</Th>
                <Th>Question</Th>
                <Th>Answer</Th>
              </Tr>
            </Thead>
            <Tbody>
                    {filteredQuestions.map((item, index) => (
                <Tr key={index}>
                    <Td>{item.pmid}</Td>
                  <Td>{item.question}</Td>
                  <Td>{item.raw_answer}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </>
        ) : (
              <Box textAlign="center" py={10}>
                <Text>No results found for "{searchTerm}"</Text>
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" py={10}>
            <Text>No cached questions found {pmid ? `for PMID: ${pmid}` : ""}</Text>
          </Box>
        )
      ) : searchClicked ? (
        <Box textAlign="center" py={10}>
          <Text>No cached questions found {pmid ? `for PMID: ${pmid}` : ""}</Text>
        </Box>
      ) : null}
    </VStack>
  );
};

export default CacheQuestionsView;
