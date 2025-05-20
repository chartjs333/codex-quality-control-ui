import React, { useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  useColorModeValue,
  keyframes,
  Flex,
  Image,
} from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import EditView from "components/EditView";
import ImportView from "components/ImportView";
import SymptomsView from "components/SymptomsView";
import PdfUploadView from "components/PdfUploadView";
import MappingDataView from "components/MappingDataView";
import CacheQuestionsView from "components/CacheQuestionsView";
import DocumentDeletion from "components/DocumentDeletion";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const QualityControlDashboard = () => {
  const [activeMainTab, setActiveMainTab] = useState(0);
  const [activeGeneSubTab, setActiveGeneSubTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const bgColor = useColorModeValue("gray.50", "gray.700");

  // Функция для перехода к импорту с выбранным файлом
  const handleEditFile = (fileName) => {
    setSelectedFile(fileName);
    setActiveGeneSubTab(1); // Переключаемся на вкладку Import
  };

  // Функция для сброса выбранного файла при возврате к Edit
  const handleTabChange = (index) => {
    setActiveGeneSubTab(index);
    if (index === 0) {
      setSelectedFile(null); // Сбрасываем выбранный файл при возврате к Edit
    }
  };

  return (
    <Box
      p={5}
      bg={bgColor}
      borderRadius="lg"
      shadow="md"
      animation={`${fadeIn} 0.5s ease-in`}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl" color="#00202c">
          Quality Control
        </Heading>
        <Image src="/GP2_logo.svg" alt="GP2 logo" maxH="50px" />
      </Flex>

      <Tabs index={activeMainTab} onChange={setActiveMainTab}>
        <TabList>
          <Tab _selected={{ color: "blue.500", borderColor: "blue.500" }}>
            Genes
          </Tab>
          <Tab _selected={{ color: "blue.500", borderColor: "blue.500" }}>
            Symptoms
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Tabs index={activeGeneSubTab} onChange={handleTabChange}>
              <TabList mb={4}>
                <Tab
                  _selected={{ color: "green.500", borderColor: "green.500" }}
                >
                  Edit
                </Tab>
                <Tab
                  _selected={{ color: "green.500", borderColor: "green.500" }}
                >
                  Import
                </Tab>
                <Tab
                  _selected={{ color: "green.500", borderColor: "green.500" }}
                >
                  Upload PDF
                </Tab>
                <Tab
                  _selected={{ color: "green.500", borderColor: "green.500" }}
                >
                  Mapping Data
                </Tab>
                <Tab
                  _selected={{ color: "green.500", borderColor: "green.500" }}
                >
                  Cached Questions
                </Tab>
                <Tab
                  _selected={{ color: "green.500", borderColor: "green.500" }}
                >
                  Document Deletion
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <EditView onEditFile={handleEditFile} />
                </TabPanel>
                <TabPanel>
                  <ImportView initialFile={selectedFile} />
                </TabPanel>
                <TabPanel>
                  <PdfUploadView />
                </TabPanel>
                <TabPanel>
                  <MappingDataView />
                </TabPanel>
                <TabPanel>
                  <CacheQuestionsView />
                </TabPanel>
                <TabPanel>
                  <DocumentDeletion />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>

          <TabPanel>
            <DndProvider backend={HTML5Backend}>
              <SymptomsView />
            </DndProvider>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default QualityControlDashboard;
