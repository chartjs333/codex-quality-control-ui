import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  FormHelperText,
  useDisclosure,
  VStack,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMappingField } from "api/api-service.js";

const MappingFieldAddModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    field: "",
    question: "",
    mapped_excel_column: "",
    response_convertion_strategy: "",
    custom_processor: "default",
    query_processor: "gemini",
    active: true,
  });

  const addMutation = useMutation({
    mutationFn: (data) => addMappingField(data),
    onSuccess: () => {
      toast({
        title: "Field added",
        description: "The new mapping field has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries(["mapping_data"]);
      // Reset form
      setFormData({
        field: "",
        question: "",
        mapped_excel_column: "",
        response_convertion_strategy: "",
        custom_processor: "default",
        query_processor: "gemini",
        active: true,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Add failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.field) {
      toast({
        title: "Validation error",
        description: "Field name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.question) {
      toast({
        title: "Validation error",
        description: "Question is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    addMutation.mutate(formData);
  };

  return (
    <>
      <Button
        size="sm"
        leftIcon={<AddIcon />}
        colorScheme="green"
        onClick={onOpen}
      >
        Add Field
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Mapping Field</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Field Name</FormLabel>
                <Input
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="e.g., motor_symptoms"
                />
                <FormHelperText>The unique identifier for this field</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Question</FormLabel>
                <Textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter the question to be asked for this field"
                />
                <FormHelperText>The question to be asked for this field</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Mapped Excel Column</FormLabel>
                <Input
                  name="mapped_excel_column"
                  value={formData.mapped_excel_column}
                  onChange={handleChange}
                  placeholder="e.g., Dynamic Motor Symptom Columns"
                />
                <FormHelperText>The Excel column this field maps to</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Response Conversion Strategy</FormLabel>
                <Textarea
                  name="response_convertion_strategy"
                  value={formData.response_convertion_strategy}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe how to convert the response for this field"
                />
                <FormHelperText>How to convert the response for this field</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Custom Processor</FormLabel>
                <Select
                  name="custom_processor"
                  value={formData.custom_processor}
                  onChange={handleChange}
                >
                  <option value="default">default</option>
                  <option value="motor_symptoms">motor_symptoms</option>
                  <option value="non_motor_symptoms">non_motor_symptoms</option>
                </Select>
                <FormHelperText>The processor to use for this field</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Query Processor</FormLabel>
                <Select
                  name="query_processor"
                  value={formData.query_processor}
                  onChange={handleChange}
                >
                  <option value="gemini">gemini</option>
                  <option value="gpt-4">gpt-4</option>
                  <option value="claude">claude</option>
                </Select>
                <FormHelperText>The AI model to use for processing queries</FormHelperText>
              </FormControl>

              <FormControl>
                <HStack>
                  <FormLabel htmlFor="active" mb="0">
                    Active
                  </FormLabel>
                  <Switch
                    id="active"
                    name="active"
                    isChecked={formData.active}
                    onChange={handleChange}
                  />
                </HStack>
                <FormHelperText>Whether this field is active</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={addMutation.isPending}
            >
              Add
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MappingFieldAddModal;
