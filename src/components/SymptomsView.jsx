import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  useToast,
  Button,
  Input,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  diseasesGenesQuery,
  symptomsQuery,
  updateSymptomCategory,
  mergeSymptoms, renameSymptom,
} from "api/api-service.js";
import {DndProvider, useDrop} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableItem from "./DraggableItem";
import CustomDropdown from "./CustomDropdown";
import MergeDropZone from "./MergeDropZone";

const SymptomsView = () => {
  const [selectedGene, setSelectedGene] = useState("");
  const [symptomsData, setSymptomsData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [symptomsToMerge, setSymptomsToMerge] = useState([]);
  const [mergedSymptomName, setMergedSymptomName] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const [{ isOver }, drop] = useDrop({
    accept: "SYMPTOM",
    drop: (item) => {
      if (item.category !== 'merge') {
        setSymptomsToMerge(prev => {
          if (!prev.includes(item.item)) {
            return [...prev, item.item];
          }
          return prev;
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const { data: genes, isLoading: genesLoading } = useQuery(diseasesGenesQuery());
  const {
    data: initialSymptomsData,
    isLoading: symptomsLoading,
    error: symptomsError,
  } = useQuery({
    ...symptomsQuery(selectedGene),
    enabled: !!selectedGene,
  });

  useEffect(() => {
    if (initialSymptomsData) {
      setSymptomsData(initialSymptomsData);
      if (!selectedCategory) {
        setSelectedCategory(Object.keys(initialSymptomsData)[0] || "");
      }
    }
  }, [initialSymptomsData, selectedCategory]);

  const updateSymptomCategoryMutation = useMutation({
    mutationFn: updateSymptomCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["symptoms", selectedGene]);
      toast({
        title: "Symptom order updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating symptom order",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateBackend = useCallback(
    (newData) => {
      const updatedSymptoms = [];
      Object.entries(newData).forEach(([category, symptoms]) => {
        symptoms.forEach((symptom, index) => {
          updatedSymptoms.push({
            geneName: selectedGene,
            symptomName: symptom,
            categoryName: category,
            order: index,
          });
        });
      });
      console.log("Отправка данных для обновления симптомов:", updatedSymptoms);
      updateSymptomCategoryMutation.mutate(updatedSymptoms);
    },
    [selectedGene, updateSymptomCategoryMutation]
  );

  const mergeSymptomsMutation = useMutation({
    mutationFn: (data) => mergeSymptoms(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["symptoms", selectedGene]);
      toast({
        title: "Symptoms merged successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error merging symptoms",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleMergeSymptoms = () => {
    if (symptomsToMerge.length < 2) {
      toast({
        title: "Select at least 2 symptoms to merge",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!mergedSymptomName.trim()) {
      toast({
        title: "Enter a name for merged symptom",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    mergeSymptomsMutation.mutate({
      geneName: selectedGene,
      mergedSymptomName: mergedSymptomName.trim(),
      symptomsToMerge: symptomsToMerge
    });

    setSymptomsToMerge([]);
    setMergedSymptomName("");
  };

  const moveItem = useCallback(
      (dragIndex, hoverIndex, draggedItem, dragType, hoverType, dragCategory, hoverCategory, isFinalDrop) => {
        console.log("moveItem called with:", {
          dragIndex,
          hoverIndex,
          draggedItem,
          dragType,
          hoverType,
          dragCategory,
          hoverCategory,
          isFinalDrop,
        });
        if (hoverCategory === 'merge') {
          setSymptomsToMerge(prev => {
            if (!prev.includes(draggedItem)) {
              return [...prev, draggedItem];
            }
            return prev;
          });
          return;
        }

        setSymptomsData((prevData) => {
          const newData = { ...prevData };

          if (dragType === "SYMPTOM") {
            if (dragCategory === hoverCategory) {
              const items = [...newData[dragCategory]];
              items.splice(dragIndex, 1);
              items.splice(hoverIndex, 0, draggedItem);
              newData[dragCategory] = items;
            } else if (isFinalDrop) {
              if (dragCategory !== 'merge') {
                newData[dragCategory] = newData[dragCategory].filter(
                    (s) => s !== draggedItem
                );
              }
              if (!newData[hoverCategory]) {
                newData[hoverCategory] = [];
              }
              const targetItems = [...newData[hoverCategory]];
              targetItems.splice(hoverIndex, 0, draggedItem);
              newData[hoverCategory] = targetItems;
            }
          }

          console.log("Updated symptoms data before backend update:", newData);
          if (isFinalDrop && hoverCategory !== 'merge') {
            updateBackend(newData);
          }

          return newData;
        });

        if (dragCategory === 'merge' && hoverCategory !== 'merge' && isFinalDrop) {
        setSymptomsToMerge(prev => prev.filter(s => s !== draggedItem));
        }
      },
      [updateBackend]
  );

  const handleDeleteSymptom = useCallback(
    (symptom) => {
      setSymptomsData((prevData) => {
        const newData = { ...prevData };
        Object.keys(newData).forEach((category) => {
          if (category !== "Unknown") {
            newData[category] = newData[category].filter((s) => s !== symptom);
          }
        });
        if (!newData["Unknown"]) {
          newData["Unknown"] = [];
        }
        newData["Unknown"].push(symptom);
        updateBackend(newData);
        return newData;
      });
    },
    [updateBackend]
  );

  const renameSymptomMutation = useMutation({
    mutationFn: (data) => renameSymptom(data.jsonFile, data.oldName, data.newName),
    onSuccess: () => {
      queryClient.invalidateQueries(["symptoms", selectedGene]);
      toast({
        title: "Symptom renamed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error renaming symptom",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleRenameSymptom = useCallback(
      (oldName, newName) => {
        renameSymptomMutation.mutate({
          jsonFile: selectedGene,
          oldName,
          newName,
        });
      },
      [renameSymptomMutation, selectedGene]
  );


  const categories = symptomsData ? Object.keys(symptomsData) : [];

  return (
    <DndProvider backend={HTML5Backend}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h3" size="md" mb={4}>
            Select Gene
          </Heading>
          <CustomDropdown
            options={genes || []}
            value={selectedGene}
            onChange={(gene) => {
              setSelectedGene(gene);
              setSymptomsData({});
              setSelectedCategory("");
            }}
            placeholder="Select a gene"
          />
        </Box>

        {selectedGene && (
          <HStack spacing={6} align="flex-start">
            <Box flex={1}>
              <Heading as="h3" size="md" mb={4}>
                Categories
              </Heading>
              {symptomsLoading ? (
                <Spinner />
              ) : symptomsError ? (
                <Text color="red.500">
                  Error loading categories: {symptomsError.message}
                </Text>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {categories.map((category, index) => (
                      <DraggableItem
                          key={`${category}_${index}`}
                          item={category}
                          index={index}
                          type="CATEGORY"
                      category={category}
                          moveItem={moveItem}
                          onClick={() => setSelectedCategory(category)}
                          isSelected={category === selectedCategory}
                      />
                  ))}
                </VStack>
              )}
            </Box>
            <Box flex={1}>
              <Heading as="h3" size="md" mb={4}>
                Symptoms
              </Heading>
              {symptomsLoading ? (
                <Spinner />
              ) : symptomsError ? (
                <Text color="red.500">
                  Error loading symptoms: {symptomsError.message}
                </Text>
              ) : selectedCategory ? (
                <VStack align="stretch" spacing={2}>
                  {symptomsData[selectedCategory]?.map((symptom, index) => (
                      <DraggableItem
                          key={`${selectedCategory}-${symptom}`}
                          item={symptom}
                          index={index}
                          type="SYMPTOM"
                          category={selectedCategory}
                          moveItem={moveItem}
                          onRename={handleRenameSymptom}
                          onDelete={selectedCategory !== "Unknown" ? () => handleDeleteSymptom(symptom) : undefined}
                      />
                  ))}
                </VStack>
              ) : (
                <Text>Select a category to view symptoms</Text>
              )}
            </Box>
            <Box flex={1}>
              <Heading as="h3" size="md" mb={4}>
                Merge Symptoms
              </Heading>
              <VStack align="stretch" spacing={4}>
                <MergeDropZone
                    onDrop={(item) => {
                      setSymptomsToMerge(prev => {
                        if (!prev.includes(item)) {
                          return [...prev, item];
                        }
                        return prev;
                      });
                    }}
                >
                  {symptomsToMerge.map((symptom, index) => (
                      <DraggableItem
                          key={`merge-${symptom}`}
                          item={symptom}
                          index={index}
                          type="SYMPTOM"
                          category="merge"
                          moveItem={moveItem}
                          onDelete={() => setSymptomsToMerge(prev => prev.filter(s => s !== symptom))}
                      />
                  ))}
                </MergeDropZone>
                <Input
                    placeholder="Enter merged symptom name"
                    value={mergedSymptomName}
                    onChange={(e) => setMergedSymptomName(e.target.value)}
                />
                <Button
                    colorScheme="blue"
                  isDisabled={symptomsToMerge.length < 2 || !mergedSymptomName.trim()}
                    onClick={handleMergeSymptoms}
                >
                  Merge Symptoms ({symptomsToMerge.length})
                </Button>
              </VStack>
            </Box>
          </HStack>
        )}
      </VStack>
    </DndProvider>
  );
};

export default SymptomsView;
