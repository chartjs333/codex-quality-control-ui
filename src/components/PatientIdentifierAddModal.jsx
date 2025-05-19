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
    useDisclosure,
    VStack,
    useToast
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { addPatientIdentifier } from "api/api-service.js";

const PatientIdentifierAddModal = ({ filename, onAddSuccess }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [formData, setFormData] = useState({
        patient: "",
        family: "",
        // Add other fields that might be needed
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            // Validate input
            if (!formData.patient) {
                toast({
                    title: "Validation error",
                    description: "Patient ID is required",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            await addPatientIdentifier(
                filename,
                formData
            );

            toast({
                title: "Patient added",
                description: "The patient has been successfully added.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Reset form
            setFormData({
                patient: "",
                family: "",
            });

            onClose();

            // Call the callback to update data in the parent component
            if (onAddSuccess) {
                onAddSuccess();
            }
        } catch (error) {
            toast({
                title: "Add failed",
                description: error.response?.data?.message || "Failed to add patient",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <Button
                size="sm"
                leftIcon={<AddIcon />}
                colorScheme="green"
                onClick={onOpen}
                ml={2}
            >
                Add Patient
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Patient</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Patient ID</FormLabel>
                                <Input
                                    name="patient"
                                    value={formData.patient}
                                    onChange={handleChange}
                                    placeholder="Enter patient ID"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Family ID (optional)</FormLabel>
                                <Input
                                    name="family"
                                    value={formData.family}
                                    onChange={handleChange}
                                    placeholder="Enter family ID if applicable"
                                />
                            </FormControl>

                            {/* Add other fields if needed */}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Add
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default PatientIdentifierAddModal;