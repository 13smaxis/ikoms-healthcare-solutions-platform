// Type definitions for Supabase tables

export interface User {
  userid: string;
  name: string;
  email: string;
  passwordhash: string;
  usertype: 'employee' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  createdat: string;
  updatedat: string;
}

export interface Role {
  roleid: string;
  rolename: string;
  description?: string;
  permissions: Record<string, boolean>;
  status: 'active' | 'inactive';
  createdat: string;
  updatedat: string;
}

export interface StaffAssignment {
  assignmentid: string;
  userid: string;
  roleid: string;
  status: 'active' | 'inactive';
  createdat: string;
  updatedat: string;
}

export interface Store {
  storeid: string;
  name: string;
  slug: string;
  description?: string;
  managerid: string;
  status: 'active' | 'inactive';
  createdat: string;
  updatedat: string;
}

export interface Product {
  productid: string;
  storeid: string;
  producttypeid?: string;
  name: string;
  handle: string;
  sku: string;
  price: number;
  description?: string;
  model?: string;
  medical_information?: string;
  status: 'draft' | 'published' | 'archived';
  createdat: string;
  updatedat: string;
}

export interface ProductType {
  producttypeid: string;
  name: string;
  description?: string;
  createdat: string;
  updatedat: string;
}

export interface ProductFeature {
  featureid: string;
  productid: string;
  featuretext: string;
  createdat: string;
  updatedat: string;
}

export interface ProductImage {
  imageid: string;
  productid: string;
  imageurl: string;
  alttext?: string;
  displayorder: number;
  createdat: string;
  updatedat: string;
}

export interface Collection {
  collectionid: string;
  storeid: string;
  name: string;
  handle: string;
  description?: string;
  displayorder: number;
  createdat: string;
  updatedat: string;
}

export interface Tag {
  tagid: string;
  storeid: string;
  tagname: string;
  createdat: string;
  updatedat: string;
}

export interface ProductTag {
  productid: string;
  tagid: string;
  createdat: string;
}

export interface Customer {
  customerid: string;
  userid?: string;
  name: string;
  surname?: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdat: string;
  updatedat: string;
}

export interface Order {
  orderid: string;
  storeid: string;
  customerid: string;
  orderdate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalamount: number;
  shippingaddress_street?: string;
  shippingaddress_city?: string;
  shippingaddress_province?: string;
  shippingaddress_postalcode?: string;
  shippingaddress_country?: string;
  notes?: string;
  createdat: string;
  updatedat: string;
}

export interface OrderItem {
  orderitemid: string;
  orderid: string;
  productid: string;
  quantity: number;
  unitprice: number;
  createdat: string;
  updatedat: string;
}