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
    useToast
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import axios from "axios";
// Импортируем функцию из api-service.js
import { updatePublicationDetails } from "api/api-service.js";


const PublicationEditModal = ({ filename, publicationDetails, onUpdateSuccess }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [formData, setFormData] = useState({
        title: "",
        first_author_lastname: "",
        year: "",
        pmid: ""
    });

    useEffect(() => {
        if (publicationDetails && publicationDetails.publication_details) {
            const details = publicationDetails.publication_details;
            setFormData({
                title: details.title || "",
                first_author_lastname: details.first_author_lastname || "",
                year: details.year || "",
                pmid: publicationDetails.pmid || ""
            });
        }
    }, [publicationDetails, filename]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
        // Используем функцию из api-service.js
        await updatePublicationDetails(filename, formData);

            toast({
                title: "Publication updated",
                description: "The publication details have been successfully updated.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            onClose();

            // Вызываем коллбэк для обновления данных в родительском компоненте
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        } catch (error) {
            toast({
                title: "Update failed",
                description: error.response?.data?.message || "Failed to update publication details",
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
                    <ModalHeader>Edit Publication Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Title</FormLabel>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>First Author Lastname</FormLabel>
                                <Input
                                    name="first_author_lastname"
                                    value={formData.first_author_lastname}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Year</FormLabel>
                                <Input
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>PMID</FormLabel>
                                <Input
                                    name="pmid"
                                    value={formData.pmid}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default PublicationEditModal;
