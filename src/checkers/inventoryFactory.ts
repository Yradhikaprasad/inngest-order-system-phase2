export interface InventoryResult {
  source: string;
  available: boolean;
}

const PrimarySource = {
  name: "Warehouse_Alpha",
  check: async (sku: string): Promise<boolean> => {
  
    if (Math.random() < 0.3) {
      throw new Error("Primary Database Connection Failed");
    }
    return true; 
  }
};

const FallbackSource = {
  name: "Backup_Partner_API",
  check: async (sku: string): Promise<boolean> => {
    return true; 
  }
};

export const getInventorySource = (isFallback: boolean) => {
  return isFallback ? FallbackSource : PrimarySource;
};