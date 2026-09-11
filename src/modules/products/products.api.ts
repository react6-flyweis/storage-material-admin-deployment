import { apiClient } from "@/modules/auth/auth.api";
import type {
  GetProductsParams,
  GetProductsResponse,
  CreateProductPayload,
  CreateProductResponse,
  GetProductCategoriesResponse,
} from "./products.types";

export async function getProductsProvider(params?: GetProductsParams): Promise<GetProductsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.category && params.category !== "all") queryParams.append("category", params.category);
  if (params?.subcategory && params.subcategory !== "all") queryParams.append("subcategory", params.subcategory);
  if (params?.pricingType && params.pricingType !== "all") queryParams.append("pricingType", params.pricingType);
  if (params?.vendor && params.vendor !== "all") queryParams.append("vendor", params.vendor);
  if (params?.status && params.status !== "all") queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const url = `/api/admin/products${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetProductsResponse>(url);
  return response.data;
}

export async function createProductProvider(payload: CreateProductPayload): Promise<CreateProductResponse> {
  const response = await apiClient.post<CreateProductResponse>("/api/admin/products", payload);
  return response.data;
}

export async function getProductCategoriesProvider(): Promise<GetProductCategoriesResponse> {
  const response = await apiClient.get<GetProductCategoriesResponse>("/api/admin/products/categories");
  return response.data;
}

export async function exportProductsProvider(params?: GetProductsParams): Promise<Blob> {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.category && params.category !== "all") queryParams.append("category", params.category);
  if (params?.subcategory && params.subcategory !== "all") queryParams.append("subcategory", params.subcategory);
  if (params?.pricingType && params.pricingType !== "all") queryParams.append("pricingType", params.pricingType);
  if (params?.vendor && params.vendor !== "all") queryParams.append("vendor", params.vendor);
  if (params?.status && params.status !== "all") queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const url = `/api/admin/products/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}


