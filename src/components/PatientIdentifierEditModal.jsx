import React, { useState, useEffect } from "react";
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
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { updatePatientIdentifier, deletePatientIdentifier } from "api/api-service.js";

const PatientIdentifierEditModal = ({ filename, patient, onUpdateSuccess }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const cancelRef = React.useRef();
    const toast = useToast();

    const [formData, setFormData] = useState({
        patient: "",
        family: "",
        // Add other fields that might be needed
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                patient: patient.patient || "",
                family: patient.family || "",
                // Initialize other fields if needed
            });
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            await updatePatientIdentifier(
                filename,
                patient.patient, // Original patient ID
                patient.family, // Original family ID
                formData
            );

            toast({
                title: "Patient information updated",
                description: "The patient information has been successfully updated.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            onClose();

            // Call the callback to update data in the parent component
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        } catch (error) {
            toast({
                title: "Update failed",
                description: error.response?.data?.message || "Failed to update patient information",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async () => {
        try {
            await deletePatientIdentifier(
                filename,
                patient.patient,
                patient.family
            );

            toast({
                title: "Patient deleted",
                description: "The patient has been successfully deleted.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setIsDeleteAlertOpen(false);
            onClose();

            // Call the callback to update data in the parent component
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        } catch (error) {
            toast({
                title: "Delete failed",
                description: error.response?.data?.message || "Failed to delete patient",
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
                leftIcon={<EditIcon />}
                colorScheme="teal"
                variant="ghost"
                onClick={onOpen}
                ml={2}
            >
                Edit
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Patient Information</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Patient ID</FormLabel>
                                <Input
                                    name="patient"
                                    value={formData.patient}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Family ID</FormLabel>
                                <Input
                                    name="family"
                                    value={formData.family}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            {/* Add other fields if needed */}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button colorScheme="red" mr={3} leftIcon={<DeleteIcon />} onClick={() => setIsDeleteAlertOpen(true)}>
                            Delete
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsDeleteAlertOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Patient
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this patient? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default PatientIdentifierEditModal;
