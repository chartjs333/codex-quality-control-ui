import React, { useRef, useState } from 'react';
import { Box, HStack, IconButton, useDisclosure } from '@chakra-ui/react';
import { Trash2, Pencil } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import EditSymptomModal from './EditSymptomModal';

const DraggableItem = ({
    item,
    index,
    type,
    category,
    moveItem,
    onDelete,
    onRename,
    onClick,
    isSelected
}) => {
    const ref = useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [{ isDragging }, drag] = useDrag({
        type: type,
        item: { index, item, type, category },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: [type, 'SYMPTOM'],
        hover: (draggedItem, monitor) => {
            if (!ref.current) {
                return;
            }

            const dragIndex = draggedItem.index;
            const hoverIndex = index;
            const dragCategory = draggedItem.category;
            const hoverCategory = category;

            if (dragIndex === hoverIndex && dragCategory === hoverCategory) {
                return;
            }

            moveItem(
                dragIndex,
                hoverIndex,
                draggedItem.item,
                draggedItem.type,
                draggedItem.type,
                dragCategory,
                hoverCategory,
                false
            );

            draggedItem.index = hoverIndex;
        },
        drop: (draggedItem) => {
            moveItem(
                draggedItem.index,
                index,
                draggedItem.item,
                draggedItem.type,
                draggedItem.type,
                draggedItem.category,
                category,
                true
            );
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const dragDropRef = (el) => {
        ref.current = el;
        drag(drop(el));
    };

    const handleRename = (newName) => {
        if (onRename && newName !== item) {
            onRename(item, newName);
        }
    };

    return (
        <>
        <Box
            ref={dragDropRef}
            p={2}
            bg={isOver ? 'blue.50' : isSelected ? 'blue.100' : 'white'}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            opacity={isDragging ? 0.4 : 1}
            cursor="move"
            onClick={onClick}
            _hover={{ bg: 'gray.50' }}
            userSelect="none"
            pointerEvents="auto"
            position="relative"
            transition="all 0.2s"
            role="button"
            tabIndex={0}
        >
            <HStack justify="space-between" spacing={2}>
                <Box flex={1}>{item}</Box>
                    {category !== "Unknown" && (
                        <>
                            <IconButton
                                icon={<Pencil size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpen();
                                }}
                                _hover={{ bg: 'blue.50' }}
                                aria-label="Rename item"
                                isDisabled={isDragging}
                            />
                            {onDelete && (
                    <IconButton
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        _hover={{ bg: 'red.50' }}
                        aria-label="Delete item"
                        isDisabled={isDragging}
                    />
                )}
                        </>
                    )}
            </HStack>
        </Box>

            <EditSymptomModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleRename}
                initialValue={item}
            />
        </>
    );
};

export default DraggableItem;