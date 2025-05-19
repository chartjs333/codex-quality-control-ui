import React from 'react';
import { Box, Text, Select, HStack } from '@chakra-ui/react';

const ColumnCategorizer = ({ columns }) => {
    return (
        <Box>
            {columns.map((column, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={2}>
                    <HStack justify="space-between">
                        <Text fontWeight="bold" flex="1">{column.name}</Text>
                        <Select placeholder="Select category" defaultValue={column.category} flex="1">
                            <option value="Nominal">Nominal</option>
                            <option value="Ordinal">Ordinal</option>
                            <option value="Interval">Interval</option>
                            <option value="Ratio">Ratio</option>
                        </Select>
                    </HStack>
                </Box>
            ))}
        </Box>
    );
};

export default ColumnCategorizer;
