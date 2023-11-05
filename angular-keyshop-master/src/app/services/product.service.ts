import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';
//branie danych z json rozdzielanie ich i przypisywanie do products
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private categoryUrl = environment.retroShopApiUrl + '/product-category';
  // private baseURL = "http://localhost:8080/api/products?size=100"
  private baseURL = environment.retroShopApiUrl + '/products';
  constructor(private httpClient: HttpClient) {}

  getProductListPaginate(
    thePage: number,
    thePageSize: number,
    theCategoryId: number
  ): Observable<GetResponseProducts> {
    //URL based on category id, page, pageSize
    const searchURL =
      `${this.baseURL}/search/findByCategoryId?id=${theCategoryId}` +
      `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

  getProductList(theCategoryId: number): Observable<Product[]> {
    //URL based on category id
    const searchURL = `${this.baseURL}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchURL);
  }

  searchProducts(theKeyword: string): Observable<Product[]> {
    const searchURL = `${this.baseURL}/search/findByNameContaining?name=${theKeyword}`;
    return this.getProducts(searchURL);
  }

  searchProductsPaginate(
    thePage: number,
    thePageSize: number,
    theKeyword: string
  ): Observable<GetResponseProducts> {
    const searchURL =
      `${this.baseURL}/search/findByNameContaining?name=${theKeyword}` +
      `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

  private getProducts(searchURL: string): Observable<Product[]> {
    return this.httpClient
      .get<GetResponseProducts>(searchURL)
      .pipe(map((response) => response._embedded.products));
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient
      .get<GetResponseProductCategory>(this.categoryUrl)
      .pipe(map((response) => response._embedded.productCategory));
  }

  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseURL}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  };
}
