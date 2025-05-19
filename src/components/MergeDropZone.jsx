// MergeDropZone.jsx
import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useDrop } from 'react-dnd';

const MergeDropZone = ({ children, onDrop }) => {
    const [{ isOver }, drop] = useDrop({
        accept: "SYMPTOM",
        drop: (item) => {
            if (item.category !== 'merge') {
                onDrop(item.item);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <Box
            ref={drop}
            border="2px dashed"
            borderColor={isOver ? "blue.400" : "gray.300"}
            borderRadius="md"
            p={4}
            minH="200px"
            bg={isOver ? "blue.50" : "transparent"}
            transition="all 0.2s"
        >
            <VStack align="stretch" spacing={2}>
                {children}
            </VStack>
        </Box>
    );
};

export default MergeDropZone;