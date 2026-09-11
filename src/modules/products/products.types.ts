export type Product = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  skuPartCode?: string;
  vendorShipper?: string;
  productImage?: string | null;
  pricingType?: string;
  unit?: string;
  baseCost?: number;
  defaultMargin?: number;
  sellingPrice?: number;
  minMargin?: number;
  maxMargin?: number;
  inputTypeRequired?: string;
  defaultQty?: number;
  taxCategory?: string;
  accountCode?: string;
  taxable?: boolean;
  usageMapping?: string[];
  smdtLinkedCode?: string;
  smdtLastSynced?: string | null;
  smdtSyncSource?: string | null;
  status?: string;
  effectiveFrom?: string | null;
  priceLock?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  pricingType?: string;
  vendor?: string;
  status?: string;
};

export type GetProductsData = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

export type GetProductsResponse = {
  success: boolean;
  message: string;
  data: GetProductsData;
};

export type CreateProductPayload = Partial<Omit<Product, "_id" | "createdAt" | "updatedAt" | "__v">>;

export type CreateProductResponse = {
  success: boolean;
  message: string;
  data: Product;
};

export type ProductCategoriesData = {
  categories: string[];
  subcategories: string[];
  vendors: string[];
};

export type GetProductCategoriesResponse = {
  success: boolean;
  message: string;
  data: ProductCategoriesData;
};

