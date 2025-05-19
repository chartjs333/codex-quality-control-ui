import React from "react";
import Routes, { RouterProvider } from "./pages";
import { ChakraProvider } from "./providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider>
      <RouterProvider>
        <QueryClientProvider client={queryClient}>
          <Routes />
        </QueryClientProvider>
      </RouterProvider>
    </ChakraProvider>
  );
}

export default App;

// http://localhost:8080/api/files => ["GBA_PSP-GBA.xlsx","GBA_AD.xlsx","GBA_TEST.xlsx","GBA_GD.xlsx","GBA_CBD.xlsx","GBA_DBA.xlsx","GBA_FTD.xlsx","GBA_MSA.xlsx","GBA_GD_CBS.xlsx","GBA_DLB_AD-GBA.xlsx","GBA_OTHER-GBA.xlsx","GBA_GD-DLB.xlsx","GBA_PKS.xlsx","GBA_GD_PD_GBA.xlsx","GBA_PD.xlsx"]
// http://localhost:8080/api/gene/list_genes => ["PINK1","ACMSD","PRKN","EIF4G1","GIGYF2","HAX1","LRRK2","GBA","POLG","GAA","CHIT1","HFE1","PSEN1","DJ-1"]
// http://localhost:8080/api/gene/list_symptoms?gene_id=HFE1
// http://localhost:8080/api/gene/list_categories
