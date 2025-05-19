import React from 'react';
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
} from '@chakra-ui/react';

const EditSymptomModal = ({ isOpen, onClose, onSave, initialValue }) => {
    const [symptomName, setSymptomName] = React.useState(initialValue);

    React.useEffect(() => {
        setSymptomName(initialValue);
    }, [initialValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (symptomName.trim() !== '' && symptomName !== initialValue) {
            onSave(symptomName.trim());
        onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Edit Symptom</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Symptom Name</FormLabel>
                            <Input
                                value={symptomName}
                                onChange={(e) => setSymptomName(e.target.value)}
                                placeholder="Enter symptom name"
                                autoFocus
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            type="submit"
                            isDisabled={!symptomName.trim() || symptomName === initialValue}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default EditSymptomModal;